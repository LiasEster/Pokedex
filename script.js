//this is the refactored version of the code and it is more readable and maintainable
let allPokemon = [];
let displayedPokemonCount = 0;

async function fetchAllPokemon() {
  const url = "https://pokeapi.co/api/v2/pokemon?limit=1200";
  const response = await fetch(url);
  const data = await response.json();
  allPokemon = await Promise.all(
    data.results.map(async (result, index) => {
      const pokemonData = await fetchPokemonData(result.url);
      return {
        name: result.name,
        id: index + 1,
        image: pokemonData.sprites.front_default,
        type: pokemonData.types.map((type) => type.type.name).join(", "),
      };
    })
  );
  displayPokemon(40, 0);
}

async function fetchPokemonData(url) {
  const response = await fetch(url);
  return await response.json();
}

function displayPokemon(count, start = 0) {
  const pokedex = document.getElementById("pokedex");
  pokedex.classList.add("grid");
  for (let i = start; i < start + count; i++) {
    const poke = allPokemon[i];
    if (poke) {
      const pokemonCard = createPokemonCard(poke, i);
      pokedex.appendChild(pokemonCard);
    }
  }
  displayedPokemonCount += count;
}

function createPokemonCard(poke, index) {
  const pokemonCard = document.createElement("div");
  pokemonCard.classList.add("pokemon-card");
  poke.type.split(", ").forEach((type) => pokemonCard.classList.add(type));
  pokemonCard.innerHTML = generatePokemonCardHTML(poke);
  pokemonCard.addEventListener("click", function () {
    displayPokemonDetails(poke, index, allPokemon);
  });
  return pokemonCard;
}

function generatePokemonCardHTML(poke) {
  return `
        <p>#${poke.id}</p>
        <h2>${poke.name}</h2>
        <img src="${poke.image}" alt="${poke.name}">
        <p>${poke.type}</p>
    `;
}

// Function to create and display the overlay
function displayOverlay(pokemonCard) {
  const overlay =
    document.getElementById("overlay") || document.createElement("div");
  overlay.id = "overlay";
  document.body.appendChild(overlay);
  overlay.innerHTML = "";
  overlay.appendChild(pokemonCard);
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Function to handle overlay click
function handleOverlayClick(event, overlay) {
  if (event.target === overlay) {
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Function to handle keydown event
function handleKeydownEvent(event, overlay) {
  if (
    overlay.style.display === "flex" &&
    (event.key === "ArrowRight" || event.key === "ArrowLeft")
  ) {
    const index = allPokemon.findIndex(
      (poke) =>
        poke.name ===
        overlay.querySelector(".pokemon-details-card h2").textContent.toLowerCase()
    );
    if (event.key === "ArrowRight" && index < allPokemon.length - 1) {
      displayPokemonDetails(allPokemon[index + 1], index + 1, allPokemon);
    } else if (event.key === "ArrowLeft" && index > 0) {
      displayPokemonDetails(allPokemon[index - 1], index - 1, allPokemon);
    }
  }
}

async function displayPokemonDetails(poke, index, pokemons) {
  const data = await fetchPokemonData(
    `https://pokeapi.co/api/v2/pokemon/${poke.name}`
  );
  const pokemonCard = createPokemonCardDetails(data, index, pokemons);
  displayOverlay(pokemonCard);
  createPokemonChart(data);
  addArrowClickEvents(index, pokemons);

  const overlay = document.getElementById("overlay");

  // Add click event listener to the overlay
  overlay.addEventListener("click", function (event) {
    handleOverlayClick(event, overlay);
  });

  // Add keydown event listener to the document
  document.addEventListener("keydown", function (event) {
    handleKeydownEvent(event, overlay);
  });
}

function createPokemonCardDetails(data, index, pokemons) {
  const pokemonCard = document.createElement("div");
  pokemonCard.classList.add("pokemon-details-card");
  data.types.forEach((type) => pokemonCard.classList.add(type.type.name));
  pokemonCard.innerHTML = generatePokemonCardDetailsHTML(data);
  return pokemonCard;
}

function generatePokemonCardDetailsHTML(data) {
  return `
        <div class="pokemon-images">
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <img src="${data.sprites.back_default}" alt="${data.name} back">
        </div>
        <h2>${data.name.toUpperCase()}</h2>
        <hr>
        <p>ID: #${data.id}</p>
        <p>Type: ${data.types.map((type) => type.type.name).join(", ")}</p>
        <hr>
        <p>Height: ${data.height / 10} m</p>
        <p>Weight: ${data.weight / 10} kg</p>
        <p>Base experience: ${data.base_experience}</p>
        <div class="chart-container">
            <canvas id="pokemon-stats-chart"></canvas>
        </div>
        <div id="next-arrow"></div>
        <div id="prev-arrow"></div>
    `;
}

function createPokemonChart(data) {
  const ctx = document.getElementById("pokemon-stats-chart").getContext("2d");
  const colors = ["green", "red", "yellow", "orange", "purple", "blue"];
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.stats.map((stat) => stat.stat.name),
      datasets: [
        {
          label: "Stats",
          data: data.stats.map((stat) => stat.base_stat),
          backgroundColor: data.stats.map((stat, index) => colors[index]),
          borderColor: data.stats.map((stat, index) => colors[index]),
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      scales: {
        x: {
          beginAtZero: true,
        },
      },
    },
  });
}

function addArrowClickEvents(index, pokemons) {
  const nextArrow = document.getElementById("next-arrow");
  nextArrow.addEventListener("click", function (event) {
    event.stopPropagation();
    if (index < pokemons.length - 1) {
      displayPokemonDetails(pokemons[index + 1], index + 1, pokemons);
    }
  });

  const prevArrow = document.getElementById("prev-arrow");
  prevArrow.addEventListener("click", function (event) {
    event.stopPropagation();
    if (index > 0) {
      displayPokemonDetails(pokemons[index - 1], index - 1, pokemons);
    }
  });
}

function handleNextClick(index, pokemons) {
  if (index < pokemons.length - 1) {
    displayPokemonDetails(pokemons[index + 1], index + 1, pokemons);
  } else {
    displayPokemonDetails(pokemons[0], 0, pokemons);
  }
}

function handlePrevClick(index, pokemons) {
  if (index > 0) {
    displayPokemonDetails(pokemons[index - 1], index - 1, pokemons);
  } else {
    displayPokemonDetails(pokemons[pokemons.length - 1], pokemons.length - 1, pokemons);
  }
}

function addArrowClickEvents(index, pokemons) {
  let nextArrow = document.getElementById("next-arrow");
  let prevArrow = document.getElementById("prev-arrow");

  nextArrow.replaceWith(nextArrow.cloneNode(true));
  prevArrow.replaceWith(prevArrow.cloneNode(true));

  nextArrow = document.getElementById("next-arrow");
  prevArrow = document.getElementById("prev-arrow");

  nextArrow.addEventListener("click", function (event) {
    event.stopPropagation();
    handleNextClick(index, pokemons);
  });

  prevArrow.addEventListener("click", function (event) {
    event.stopPropagation();
    handlePrevClick(index, pokemons);
  });
}

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", function () {
  const pokedex = document.getElementById("pokedex");
  if (searchInput.value.length >= 3) {
    const filteredPokemon = allPokemon.filter((poke) =>
      poke.name.includes(searchInput.value.toLowerCase())
    );
    displayFilteredPokemon(filteredPokemon);
  } else {
    pokedex.innerHTML = "";
    displayPokemon(40, 0);
  }
});

function displayFilteredPokemon(pokemon) {
  const pokedex = document.getElementById("pokedex");
  pokedex.innerHTML = "";
  pokemon.forEach((poke, index) => {
    const pokemonCard = createPokemonCard(poke, index);
    pokedex.appendChild(pokemonCard);
  });
}

const loadMoreButton = document.getElementById("load-more");

loadMoreButton.addEventListener("click", function () {
  displayPokemon(40, displayedPokemonCount);
});

function displayPokemon(count, start = 0) {
  const pokedex = document.getElementById("pokedex");
  pokedex.classList.add("grid");
  let displayedCount = 0;
  for (let i = start; i < start + count; i++) {
    const poke = allPokemon[i];
    if (poke) {
      const pokemonCard = createPokemonCard(poke, i);
      pokedex.appendChild(pokemonCard);
      displayedCount++;
    }
  }
  displayedPokemonCount += displayedCount;
}
