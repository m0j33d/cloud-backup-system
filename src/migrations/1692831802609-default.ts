import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1692831802609 implements MigrationInterface {
    name = 'Default1692831802609'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ADD "mimeType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "mimeType"`);
    }

}
