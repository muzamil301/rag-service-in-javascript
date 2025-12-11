import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';

// Transformer for vector type (pgvector)
// pgvector stores vectors as strings like "[1,2,3]" in the database
const vectorTransformer: ValueTransformer = {
  to: (value: number[] | string | null) => {
    if (value === null || value === undefined) {
      return null;
    }
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`;
    }
    return value;
  },
  from: (value: string | null) => {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'string') {
      // Parse vector string like "[1,2,3]" to array
      const cleaned = value.replace(/[\[\]]/g, '').trim();
      if (!cleaned) {
        return null;
      }
      return cleaned.split(',').map((v) => parseFloat(v.trim()));
    }
    return value;
  },
};

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
    transformer: vectorTransformer,
  })
  embedding: number[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

