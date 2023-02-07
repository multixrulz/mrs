// This isn't quite right (ie leapseconds), but it'll do
const ms_in_day = 24*60*60*1000;
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday"];

class detTerm {
    constructor(year, term, firstday, firststudentday, lastday, firstdayhols) {
    // year, term - integers
    // firstday, lastday, firstdayhols - dates
    // firstdayhols is the first day of the holidays that precede this term
    this.year = year;
    this.term = term;
    this.firstday = firstday;
    this.firststudentday = firststudentday;
    this.lastday = lastday;
    this.firstdayhols = firstdayhols;
    }

    contains(date) {
        // Returns true if the given date falls within this term.
        return (date >= this.firststudentday) && (date <= this.lastday);
    }

    holidaycontains(date) {
        // Returns true if the given date falls within the holiday prior to this term.
        return (date >= this.firstdayhols) && (date < this.firststudentday);
    }

    week(date) {
        // Returns the week number within the term for the given date.
        //
        // If the date is not in the term, it returns the first or last
        // week of the term (whichever is closer)
        if (date < this.firstday)
            date = this.firstday;
        else if (date > this.lastday)
            date = this.lastday;
        // Bring firstday back to Sunday
        var week1start = new Date(this.firstday);
        week1start.setDate(this.firstday.getDate() - this.firstday.getDay());
        // Add 1 week because weeks start at 1, not 0
        return Math.floor(((date - week1start) / ms_in_day) / 7) + 1;
    }

    day(date) {
        // Returns the numerical day of the week (0=Sunday as defined by
        // JavaScript) within the term for the given date.
        //
        // If the date is on the weekend, Saturday returns Friday,
        // and Sunday returns Monday.
        //
        // If the date is not in the term, it returns the first or last
        // day of the term (whichever is closer)
        if (date < this.firstday)
            date = this.firstday;
        else if (date > this.lastday)
            date = this.lastday;
        return date.getUTCDay();
    }

    date(week, day) {
        // Returns the date object for the given week number
        // and day of the week.
        // If the date ends up outside the term, the first/last date
        // of term is returned instead.
        // week - integer
        // day - integer, 0=Sunday as defined by JavaScript
        var offset = this.firstday.getDay();
        var date = new Date(this.firstday);
        date.setDate(this.firstday.getDate() - offset + 7*(week-1) + day);
        if (date < this.firstday)
            date = this.firstday;
        else if (date > this.lastday)
            date = this.lastday;
        return date;
    }
}

function todays_url(){
    var url = "";

    today = new Date(Date.now());
    // If it's Saturday or Sunday, go ahead to Monday
    day_of_week = today.getDay;
    if (day_of_week == 6) // Saturday
        today = today + 2;
    if (day_of_week == 0) // Sunday
        today = today + 1;
    
    // See if we're in a term, and create the URL
    for (t in terms) {
        // Is this day in an actual term?
        if (terms[t].contains(today)) {
            url = "/" +
                terms[t].year + "/" +
                terms[t].term + "/" +
                terms[t].week(today) + "/" +
                days[terms[t].day(today)] + ".html";
            break; // Found the right term, don't check others
        }
        // Are we in the holidays? Go to day 1 of the term
        if (terms[t].holidaycontains(today)) {
            goto_day = terms[t].firststudentday;
            url = "/" +
                terms[t].year + "/" +
                terms[t].term + "/" +
                terms[t].week(goto_day) + "/" +
                days[terms[t].day(goto_day)] + ".html";
            break; // Found the right term, don't check others
        }
    }
    return url;
}

function set_today_link() {
    document.getElementById("today").href="/planner" + todays_url();
}

function go_to_today() {
    window.location.href = "/planner" + todays_url();
}

// Putting new terms at the top makes the todays_url() function do less
// as we move through the calendar, rather than more.
terms = [
    new detTerm(2023, 4,
        new Date("2023-10-09"), // First day
        new Date("2023-10-09"), // First student day
        new Date("2023-12-19"), // Last day
        new Date("2023-09-23")), // Start of previous holidays
    new detTerm(2023, 3,
        new Date("2023-07-17"),
        new Date("2023-07-18"),
        new Date("2023-09-22"),
        new Date("2023-07-01")),
    new detTerm(2023, 2,
        new Date("2023-04-24"),
        new Date("2023-04-26"),
        new Date("2023-06-30"),
        new Date("2023-04-07")),
    new detTerm(2023, 1,
        new Date("2023-01-27"),
        new Date("2023-02-07"),
        new Date("2023-04-06"),
        new Date("2022-12-20")),
    ];
