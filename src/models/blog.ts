export class Blog {
  constructor(
    public id: number,
    public title: string,
    public content: string,
    public author: string,
    public createdAt: Date
  ) {}
}
