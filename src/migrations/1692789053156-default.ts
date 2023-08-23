import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1692789053156 implements MigrationInterface {
    name = 'Default1692789053156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "isActive" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "isActive" DROP DEFAULT`);
    }

}
