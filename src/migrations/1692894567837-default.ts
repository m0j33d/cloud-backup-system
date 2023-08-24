import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1692894567837 implements MigrationInterface {
    name = 'Default1692894567837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" RENAME COLUMN "unSafeCount" TO "markedBy"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "markedBy"`);
        await queryRunner.query(`ALTER TABLE "file" ADD "markedBy" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "markedBy"`);
        await queryRunner.query(`ALTER TABLE "file" ADD "markedBy" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "file" RENAME COLUMN "markedBy" TO "unSafeCount"`);
    }

}
