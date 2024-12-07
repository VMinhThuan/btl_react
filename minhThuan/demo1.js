const course = { name: "Nodejs", price: "2", class: "A" };
let result = "";
for (const key in course) {
  if (key !== "price") {
    result += course[key];
  }
}
console.log(result);
