import bcrypt from "bcrypt";

async function main() {
  const password = "1234"; // cambia la contraseña si quieres
  const hash = await bcrypt.hash(password, 10);
  console.log("Hash generado:", hash);
}

main();