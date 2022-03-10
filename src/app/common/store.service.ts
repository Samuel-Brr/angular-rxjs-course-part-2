import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, timer } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { delayWhen, map, retryWhen, shareReplay, tap } from "rxjs/operators";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";

@Injectable({
    providedIn: 'root'
})

export class Store {
  saveCourse(courseId: number, changes: any): Observable<any> {

    const courses = this.subject.getValue()

    const courseIndex = courses.findIndex(course => course.id == courseId)

    const newCourses = courses.slice(0)

    newCourses[courseIndex] = {
      ...courses[courseIndex],
      ...changes
    }

    this.subject.next(newCourses)


    return fromPromise(fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
      headers: {
        'content-type' : 'application/json'
      }
    }))
  }

  selectBeginnerCourses(): Observable<Course[]> {
    return this.filterByCategorie("BEGINNER")
  }

  selectAdvancedCourses(): Observable<Course[]> {
    return this.filterByCategorie("ADVANCED")
  }

  filterByCategorie(category: string){
    return this.courses$
      .pipe(
        map(courses => courses
            .filter(course => course.category == category))
  );
  }

  private subject = new BehaviorSubject<Course[]>([])

  courses$: Observable<Course[]> = this.subject.asObservable()

  init(){
    const http$ = createHttpObservable('/api/courses');

    http$
      .pipe(
          tap(() => console.log("HTTP request executed")),
          map(res => Object.values(res["payload"]) ),
      )
      .subscribe(
        courses => this.subject.next(courses)
      )


  }
}