import { debounceTime, fromEvent, map, merge, mergeAll, startWith, switchMap } from "rxjs";
import { BlogService } from "./services/blog-service";
import { Blog } from "./models/blog";
import { QueryFilter } from "./models/query-filter";
import { QueryFilterAttributeEnum } from "./models/query-filter-attribute-enum";

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
  authorNameInput.id = QueryFilterAttributeEnum.Author;
  authorNameInput.placeholder = "Author Name";
  filterCard.appendChild(authorNameInput);

  const blogTitleInput = document.createElement("input");
  blogTitleInput.id = QueryFilterAttributeEnum.Title;
  blogTitleInput.placeholder = "Blog Title";
  filterCard.appendChild(blogTitleInput);

  const blogContentInput = document.createElement("input");
  blogContentInput.id = QueryFilterAttributeEnum.Content;
  blogContentInput.placeholder = "Blog Content";
  filterCard.appendChild(blogContentInput);

  filterSection.appendChild(filterCard);
  document.body.insertBefore(filterSection, document.body.firstChild);

  merge(
    createInputStream(authorNameInput, "input", (value) => value),
    createInputStream(blogTitleInput, "input", (value) => value),
    createInputStream(blogContentInput, "input", (value) => value)
  ).subscribe(updateBlogList);
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


function createInputStream(inputElement: HTMLInputElement, eventType: string, mapFunction: (value: string) => any)
{
  return fromEvent(inputElement, eventType)
    .pipe(
      debounceTime(500),
      map((event) => mapFunction((event.target as HTMLInputElement).value)),
      switchMap((value) => {
        page = 1;
        mapFilterFromInput(inputElement, value);
        return blogService.getBlogsPage(page, pageSize, queryFilter);
      })
    );
}


function mapFilterFromInput(inputElement: HTMLInputElement, value: string)
{
  queryFilter[inputElement.id] = value;
}
