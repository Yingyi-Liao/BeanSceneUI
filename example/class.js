class item {
  constructor(name, category, price) {
    this.name = name;
    this.category = category;
    this.price = price;
  }

  start() {
    console.log(`${this.name} is starting`);
  }

  getDetails() {
    return `${this.name} (${this.category}): $${this.price.toFixed(2)}`;
  }
}

// Create objects (instances)
const item1 = new item("Steak", "Main", 22.00);
const item2 = new item("Coke", "Drink", 4.00);

// Use the objects
item1.start(); 
console.log(item1.getDetails());

item2.start(); 
console.log(item2.getDetails());