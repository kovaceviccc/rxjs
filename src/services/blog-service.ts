import { Observable, delay, from, map, of, switchMap } from "rxjs";
import { Blog } from "../models/blog";
import { QueryFilter } from "../models/query-filter";

export class BlogService {
  constructor() {}

  public getBlogsPage(
    pageNumber: number,
    pageSize: number,
    filter: QueryFilter
  ): Observable<Blog[]> {
    console.log(filter);
    return from(fetch("http://localhost:3005/blogs")).pipe(
      switchMap((response) => response.json()),
      map((data: Blog[]) => {
        let filteredBlogs = data;

        if (filter.author.length > 0) {
          filteredBlogs = filteredBlogs.filter((blog) =>
            blog.author.includes(filter.author!)
          );
        }

        if (filter.title.length > 0) {
          filteredBlogs = filteredBlogs.filter((blog) =>
            blog.title.includes(filter.title!)
          );
        }

        if (filter.content.length > 0) {
          filteredBlogs = filteredBlogs.filter((blog) =>
            blog.content.includes(filter.content!)
          );
        }

        if (filter.createdAt) {
          filteredBlogs = filteredBlogs.filter(
            (blog) => blog.createdAt >= filter.createdAt!
          );
        }

        filteredBlogs.sort((a, b) => a.id - b.id);

        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;

        return filteredBlogs.slice(start, end);
      })
    );
  }
}
