import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("image")
export class Image {

    @PrimaryColumn({ type: "char", length: 36 })
    id: string;

    @Column({ type: "mediumtext" })
    data: string;

    @Column({ type: "datetime" })
    create_date_time: Date;

    @Column({ type: "char", length: 36, nullable: true })
    application_id: string;

    @Column({ type: "int" })
    width: number;

    @Column({ type: "int" })
    height: number;
}
