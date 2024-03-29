//this is the first file that was used in production

let allPokemon = [];
let displayedPokemonCount = 0;

async function fetchPokemon() {
    const url = 'https://pokeapi.co/api/v2/pokemon?limit=1200';
    const response = await fetch(url);
    const data = await response.json();
    allPokemon = await Promise.all(data.results.map(async (result, index) => {
        const pokemonData = await fetchPokemonData(result.url);
        return {
            name: result.name,
            id: index + 1,
            image: pokemonData.sprites.front_default,
            type: pokemonData.types.map(type => type.type.name).join(', ')
        };
    }));
    displayPokemon(40); // Display the first 40 Pokemon
}

async function fetchPokemonData(url) {
    const response = await fetch(url);
    return await response.json();
}

function displayPokemon(count) {
    const pokedex = document.getElementById('pokedex');
    pokedex.classList.add('grid');
    for (let i = displayedPokemonCount; i < displayedPokemonCount + count; i++) {
        const poke = allPokemon[i];
        if (poke) { // Check if poke is defined
            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemon-card');
            poke.type.split(', ').forEach(type => pokemonCard.classList.add(type));
            pokemonCard.innerHTML = `
                <p>#${poke.id}</p>
                <h2>${poke.name}</h2>
                <img src="${poke.image}" alt="${poke.name}">
                <p>${poke.type}</p>
            `;
            pokemonCard.addEventListener('click', function() {
                displayPokemonDetails(poke, i, allPokemon); // Pass the additional parameters
            });
            pokedex.appendChild(pokemonCard);
        }
    }
    displayedPokemonCount += count; // Update the count of displayed Pokemon
}

async function displayPokemonDetails(poke, index, pokemons) {
    const url = `https://pokeapi.co/api/v2/pokemon/${poke.name}`;
    const response = await fetch(url);
    const data = await response.json();

    const overlay = document.getElementById('overlay') || document.createElement('div');
    overlay.id = 'overlay';
    document.body.appendChild(overlay);

    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-details-card');
    data.types.forEach(type => pokemonCard.classList.add(type.type.name));
    pokemonCard.innerHTML = `
    <div class="pokemon-images">
        <img src="${data.sprites.front_default}" alt="${data.name}">
        <img src="${data.sprites.back_default}" alt="${data.name} back">
    </div>
    <h2>${data.name.toUpperCase()}</h2>
    <hr>
    <p>ID: #${data.id}</p>
    <p>Type: ${data.types.map(type => type.type.name).join(', ')}</p>
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

    pokemonCard.addEventListener('click', function(event) {
        event.stopPropagation(); // Stop the propagation of the click event
    });

    overlay.innerHTML = ''; // Clear the overlay before appending the new card
    overlay.appendChild(pokemonCard); // Append the card to the overlay

    const ctx = document.getElementById('pokemon-stats-chart').getContext('2d');
    const colors = ['green', 'red', 'yellow', 'orange', 'purple', 'blue'];

    new Chart(ctx, {
        type: 'bar', // Change the chart type to 'bar'
        data: {
            labels: data.stats.map(stat => stat.stat.name),
            datasets: [{
                label: 'Stats',
                data: data.stats.map(stat => stat.base_stat),
                backgroundColor: data.stats.map((stat, index) => colors[index]),
                borderColor: data.stats.map((stat, index) => colors[index]),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Add this line to make the chart horizontal
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });

    const nextArrow = document.getElementById('next-arrow');
    nextArrow.addEventListener('click', function(event) {
        event.stopPropagation(); // Stop the propagation of the click event
        if (index < pokemons.length - 1) {
            displayPokemonDetails(pokemons[index + 1], index + 1, pokemons);
        }
    });

    const prevArrow = document.getElementById('prev-arrow');
    prevArrow.addEventListener('click', function(event) {
        event.stopPropagation(); // Stop the propagation of the click event
        if (index > 0) {
            displayPokemonDetails(pokemons[index - 1], index - 1, pokemons);
        }
    });

    overlay.style.display = 'flex'; // Show the overlay
    document.body.style.overflow = 'hidden'; // Disable scrolling
}

let overlay = document.getElementById('overlay');
if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    document.body.appendChild(overlay);
}

overlay.addEventListener('click', function(event) {
    if (event.target === overlay) {
        overlay.style.display = 'none'; // Hide the overlay
        document.body.style.overflow = 'auto'; // Enable scrolling
    }
});

document.getElementById('search').addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase();
    const filteredPokemon = allPokemon.filter(poke => poke.name.toLowerCase().includes(searchText));
    displayPokemon(filteredPokemon);
});

document.getElementById('load-more').addEventListener('click', function() {
    displayPokemon(40); // Display 40 more Pokemon
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        // Simulate a click on the next arrow
        document.getElementById('next-arrow').click();
    } else if (event.key === 'ArrowLeft') {
        // Simulate a click on the previous arrow
        document.getElementById('prev-arrow').click();
    }
});

fetchPokemon();