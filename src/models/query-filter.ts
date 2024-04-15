export class QueryFilter {
  [key: string]: string | Date | undefined;
  public author: string = "";
  public title: string = "";
  public content: string = "";
  public createdAt?: Date;
}
