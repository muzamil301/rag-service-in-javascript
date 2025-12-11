import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Item } from '../entities/item.entity';

@Injectable()
export class CrudService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  /**
   * Create a new item
   */
  async create(createDto: Partial<Item>): Promise<Item> {
    const item = this.itemRepository.create(createDto);
    return await this.itemRepository.save(item);
  }

  /**
   * Find all items with optional pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Item[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.itemRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find one item by ID
   */
  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } as FindOptionsWhere<Item> });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  /**
   * Update an item
   */
  async update(id: number, updateDto: Partial<Item>): Promise<Item> {
    const item = await this.findOne(id);
    Object.assign(item, updateDto);
    return await this.itemRepository.save(item);
  }

  /**
   * Delete an item
   */
  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemRepository.remove(item);
  }

  /**
   * Find items by description (search)
   */
  async findByDescription(description: string): Promise<Item[]> {
    return await this.itemRepository
      .createQueryBuilder('item')
      .where('item.description ILIKE :description', {
        description: `%${description}%`,
      })
      .getMany();
  }

  /**
   * Vector similarity search (using pgvector)
   * Uses cosine distance (<->) operator for similarity search
   */
  async findSimilar(
    queryEmbedding: number[],
    limit: number = 10,
  ): Promise<Item[]> {
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    
    // Use raw SQL for pgvector operations as TypeORM doesn't support vector operators directly
    const results = await this.itemRepository
      .createQueryBuilder('item')
      .where('item.embedding IS NOT NULL')
      .orderBy(
        `item.embedding::vector <-> '${embeddingString}'::vector`,
        'ASC',
      )
      .limit(limit)
      .getMany();
    
    return results;
  }

  /**
   * Get similarity distance between two vectors
   */
  async getSimilarityDistance(
    id1: number,
    id2: number,
  ): Promise<number | null> {
    const item1 = await this.findOne(id1);
    const item2 = await this.findOne(id2);
    
    if (!item1.embedding || !item2.embedding) {
      return null;
    }

    const embedding1 = `[${item1.embedding.join(',')}]`;
    const embedding2 = `[${item2.embedding.join(',')}]`;

    const result = await this.itemRepository.query(
      `SELECT $1::vector <-> $2::vector AS distance`,
      [embedding1, embedding2],
    );

    return result[0]?.distance || null;
  }
}

