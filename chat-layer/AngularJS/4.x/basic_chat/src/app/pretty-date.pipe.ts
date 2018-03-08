import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyDate'
})
export class PrettyDatePipe implements PipeTransform {

  transform(isoDateString: string, args?: any): string {

    var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    var date = new Date(isoDateString),
      diff = (((new Date()).getTime() - date.getTime()) / 1000),
      day_diff = Math.floor(diff / 86400);

    if (isNaN(day_diff))
      return "?";

    if (day_diff < 0)
      return "just now";

    return day_diff === 0 && (
      // < 5 mons
      diff < 300 && "just now" ||
      // < 1 hour
      diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
      // same day
      diff < 7200 && "1 hour ago" ||
      diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
      // yesterday
      day_diff == 1 && "Yesterday" ||
      // < 7 days ago 
      day_diff < 7 && daysOfWeek[date.getDay()] ||
      // >= 7 days ago
      day_diff >= 7 && date.toLocaleDateString();
  }
}