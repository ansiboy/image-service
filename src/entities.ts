import { Entity, PrimaryColumn, Column } from "maishu-node-data";

@Entity("image")
export class Image {

    /** ID 格式为 GUID_WIDTH_HEIGHT */
    @PrimaryColumn({ type: "char", length: 100 })
    id: string;

    @Column({ type: "mediumtext", nullable: true })
    data: string;

    @Column({ type: "datetime" })
    create_date_time: Date;

    @Column({ type: "char", length: 36, nullable: true })
    application_id: string;

    @Column({ type: "int", nullable: true })
    width: number;

    @Column({ type: "int", nullable: true })
    height: number;

    @Column({ type: "mediumblob", nullable: true })
    bin: Buffer;

    @Column({ type: "varchar", length: 45, nullable: true })
    category?: string;

    @Column({ type: "varchar", length: 36 })
    user_id?: string;

    @Column({ type: "varchar", length: 200, nullable: true })
    remark?: string;
}

@Entity("video")
export class Video {

    @PrimaryColumn({ type: "char", length: 36 })
    id: string;

    @Column({ type: "longblob" })
    data: Buffer;

    @Column({ type: "datetime" })
    create_date_time: Date;

    @Column({ type: "char", length: 36, nullable: true })
    application_id: string;

}
