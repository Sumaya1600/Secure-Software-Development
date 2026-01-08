const bcrypt = require("bcryptjs");

async function run() {
  const users = [
    { email: "sumaya@portal.local", password: "sumaya123" },
    { email: "alex@portal.local", password: "alex123" },
    { email: "joan@portal.local", password: "joan123" }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    console.log(`USER: ${u.email}`);
    console.log(`PASSWORD: ${u.password}`);
    console.log(`HASH: ${hash}\n`);
  }
}

run();
