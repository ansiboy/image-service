import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("image")
export class Image {

    /** ID 格式为 GUID_WIDTH_HEIGHT */
    @PrimaryColumn({ type: "char", length: 100 })
    id: string;

    @Column({ type: "mediumtext" })
    data: string;

    @Column({ type: "datetime" })
    create_date_time: Date;

    @Column({ type: "char", length: 36, nullable: true })
    application_id: string;

    @Column({ type: "int", nullable: true })
    width: number;

    @Column({ type: "int", nullable: true })
    height: number;
}

