export async function getLibros() {
try {
  const response = await fetch(`http://alvaro.daw.inspedralbes.cat/api.php/records/BOOK`)
  const data = await response.json()
  return data.records;
  } catch (error) {
  console.error("Error fetching libros:", error);
  return [];
  }
}