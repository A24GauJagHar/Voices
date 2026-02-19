function getRandomSlow(callback, delayMs = 3000) {
   setTimeout(
       () => callback(Math.floor(Math.random() * 101)),
       delayMs
   );
}


console.log("1");
getRandomSlow((num) => {
   console.log("resultat: " + num);
});
console.log("2");


const getRandomPromise = () =>
   new Promise(resolve => getRandomSlow(resolve));


async function partB() {
   console.log("1");
   const num = await getRandomPromise();
   console.log("resultat: " + num);
   console.log("2");
}


partB();


