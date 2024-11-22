import { HttpException, Injectable } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
export interface PostsRo {
  list: PostsEntity[];
  count: number;
}
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) { }
  async create(post: Partial<PostsEntity>) {
    const { title } = post;
    if (!title) {
      throw new HttpException('缺少文章标题', 401);
    }
    const doc = await this.postsRepository.findOne({ where: { title } });
    if (doc) {
      throw new HttpException('文章已存在', 401);
    }
    return await this.postsRepository.save(post);
  }

  async findAll(query: any): Promise<PostsRo> {
    const qb = await this.postsRepository.createQueryBuilder('post');
    qb.where('1 = 1');
    qb.orderBy('post.create_time', 'DESC');
    const count = await qb.getCount();
    const { pageNum = 1, pageSize = 10 } = query;
    qb.limit(pageSize);
    qb.offset(pageSize * (pageNum - 1));
    const posts = await qb.getMany();
    return { list: posts, count: count };
  }
  // 获取指定文章
  async findById(id: any): Promise<PostsEntity> {
    return await this.postsRepository.findOne({ where: { id } });
  }
  // 更新文章
  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostsEntity> {
    const existPost = await this.postsRepository.findOne({ where: { id } });
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 401);
    }
    const updatePost = this.postsRepository.merge(existPost, updatePostDto);
    return this.postsRepository.save(updatePost);
  }
  // 刪除文章
  async remove(id: number) {
    const existPost = await this.postsRepository.findOne({ where: { id } });
    if (!existPost) {
      throw new HttpException(`id为${id}的文章不存在`, 401);
    }
    return await this.postsRepository.remove(existPost);
  }
}
