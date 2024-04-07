import { debounceTime, fromEvent, map, startWith, switchMap } from "rxjs";
import { BlogService } from "./services/blog-service";
import { Blog } from "./models/blog";
import { QueryFilter } from "./models/query-filter";

let page: number = 1;
let pageSize: number = 5;
var blogService: BlogService = new BlogService();
var queryFilter: QueryFilter = new QueryFilter();

const blogListElement: Element = document.querySelector("#blogList")!;

createFilteringMenu();

function createFilteringMenu() {
  const filterSection = document.createElement("div");
  filterSection.className = "filter-section";

  const filterCard = document.createElement("div");
  filterCard.className = "filter-card";
  filterCard.style.display = "flex";

  const authorNameInput = document.createElement("input");
  authorNameInput.placeholder = "Author Name";
  filterCard.appendChild(authorNameInput);

  const blogTitleInput = document.createElement("input");
  blogTitleInput.placeholder = "Blog Title";
  filterCard.appendChild(blogTitleInput);

  const blogContentInput = document.createElement("input");
  blogContentInput.placeholder = "Blog Content";
  filterCard.appendChild(blogContentInput);

  const dateCreatedInput = document.createElement("input");
  dateCreatedInput.type = "date";
  filterCard.appendChild(dateCreatedInput);

  filterSection.appendChild(filterCard);
  document.body.insertBefore(filterSection, document.body.firstChild);

  fromEvent(authorNameInput, "input")
    .pipe(
      debounceTime(500),
      map((event) => (event.target as HTMLInputElement).value),
      switchMap((value) => {
        page = 1;
        queryFilter.author = value;
        return blogService.getBlogsPage(page, pageSize, queryFilter);
      })
    )
    .subscribe(updateBlogList);

  fromEvent(blogTitleInput, "input")
    .pipe(
      debounceTime(500),
      map((event) => (event.target as HTMLInputElement).value),
      switchMap((value) => {
        page = 1;
        queryFilter.title = value;
        return blogService.getBlogsPage(page, pageSize, queryFilter);
      })
    )
    .subscribe(updateBlogList);

  fromEvent(blogContentInput, "input")
    .pipe(
      debounceTime(500),
      map((event) => (event.target as HTMLInputElement).value),
      switchMap((value) => {
        page = 1;
        queryFilter.content = value;
        return blogService.getBlogsPage(page, pageSize, queryFilter);
      })
    )
    .subscribe(updateBlogList);

  fromEvent(dateCreatedInput, "change")
    .pipe(
      debounceTime(500),
      map((event) => new Date((event.target as HTMLInputElement).value)),
      switchMap((value) => {
        page = 1;
        queryFilter.createdAt = value;
        return blogService.getBlogsPage(page, pageSize, queryFilter);
      })
    )
    .subscribe(updateBlogList);
}

function updateBlogList(blogs: Blog[], updateBlogList: boolean = false) {
  if (!updateBlogList) {
    blogListElement.innerHTML = "";
  }
  blogListElement.setAttribute("style", `--length: ${blogs.length}`);
  blogListElement.setAttribute("role", "list");
  for (const blog of blogs) {
    const li = document.createElement("li");
    li.setAttribute("style", `--i: ${blog.id}`);

    const h3 = document.createElement("h3");
    h3.textContent = blog.title;
    li.appendChild(h3);

    const p = document.createElement("p");
    p.textContent = blog.content;
    li.appendChild(p);

    const p2 = document.createElement("p");
    p2.textContent = "Author: " + blog.author;
    li.appendChild(p2);

    const p3 = document.createElement("p");
    p3.textContent = blog.createdAt.toString();
    li.appendChild(p3);

    blogListElement.appendChild(li);
  }
}

fromEvent(window, "scroll")
  .pipe(
    debounceTime(100),
    startWith(null), // This is to trigger the first call
    switchMap(() => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        return blogService.getBlogsPage(page++, pageSize, queryFilter);
      }
      return [];
    })
  )
  .subscribe((blogs: Blog[]) => {
    updateBlogList(blogs, true);
  });
