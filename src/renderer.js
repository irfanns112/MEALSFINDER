document.getElementById('searchButton')?.addEventListener('click', fetchMeals);
document.getElementById('searchMealByNameButton')?.addEventListener('click', fetchMealByName);
document.getElementById('randomMealButton')?.addEventListener('click', fetchRandomMeal);
document.getElementById('addGroceryButton')?.addEventListener('click', addGroceryItem);
document.getElementById('saveGroceryButton')?.addEventListener('click', saveIngredientsToFile);

// Fetch meals dari ingredient
async function fetchMeals() {
    const ingredient = document.getElementById('ingredientInput').value.trim();
    if (!ingredient) {
        alert('Please enter an ingredient.');
        return;
    }

    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
    const data = await response.json();
    displayMeals(data.meals);
}

// Fetch meals dari name
async function fetchMealByName() {
    const mealName = document.getElementById('mealNameInput').value.trim();
    if (!mealName) {
        alert('Please enter a meal name.');
        return;
    }

    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`);
    const data = await response.json();
    displayMeals(data.meals);
}


// Display meals 
function displayMeals(meals) {
    const mealContainer = document.getElementById('meal-container');
    mealContainer.innerHTML = '';

    if (!meals) {
        mealContainer.innerHTML = '<p>No meals found.</p>';
        return;
    }

    meals.forEach(meal => {
        const mealElement = document.createElement('div');
        mealElement.classList.add('meal');
        mealElement.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
            <button onclick="fetchMealDetails(${meal.idMeal})">View Details</button>
            <button onclick="addToFavorites('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">Add to Favorites</button>
        `;
        mealContainer.appendChild(mealElement);
    });
}

// Fetch meal details 
async function fetchMealDetails(id) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        const meal = data.meals[0];
        openModal(meal);
    } catch (error) {
        console.error('Error fetching meal details:', error);
        alert('Failed to fetch meal details. Please try again.');
    }
}

// Open modal with meal details, Add to Planner and Add to Favorites buttons
function openModal(meal) {
    const modal = document.getElementById('mealModal');
    const modalContent = document.querySelector('.modal-content');

    modalContent.innerHTML = `
        <span class="close-btn" onclick="closeModal()">&times;</span>
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <br>
        <p><strong>Category:</strong> ${meal.strCategory}</p>
        <br>
        <p><strong>Area:</strong> ${meal.strArea}</p>
        <h3>Ingredients:</h3>
        <ul>${getIngredients(meal)}</ul>
        <p>${meal.strInstructions}</p>
        ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a>` : ''}
        <button onclick="addMealToPlanner('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">Add to Planner</button>
        <button onclick="addToFavorites('${meal.idMeal}', '${meal.strMeal}', '${meal.strMealThumb}')">Add to Favorites</button>
    `;

    modal.style.display = 'flex';
}

// Close the modal
function closeModal() {
    document.getElementById('mealModal').style.display = 'none';
}

// Extract ingredients from meal data
function getIngredients(meal) {
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient) {
            ingredients += `<li>${measure} ${ingredient}</li>`;
        }
    }
    return ingredients;
}

// Add meal to planner and store in LocalStorage
function addMealToPlanner(id, name, thumbnail) {
    let planner = JSON.parse(localStorage.getItem('mealPlanner')) || [];
    const meal = { id, name, thumbnail };

    // Check if the meal is already in the planner to avoid duplicates
    const exists = planner.some(item => item.id === id);
    if (!exists) {
        planner.push(meal);
        localStorage.setItem('mealPlanner', JSON.stringify(planner));
        alert(`${name} has been added to your planner!`);
    } else {
        alert(`${name} is already in your planner.`);
    }
}

// Add meal to favorites and store in LocalStorage
function addToFavorites(id, name, thumbnail) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const meal = { id, name, thumbnail };

    // Avoid adding duplicate favorites
    const exists = favorites.some(item => item.id === id);
    if (!exists) {
        favorites.push(meal);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${name} has been added to your favorites!`);
    } else {
        alert(`${name} is already in your favorites.`);
    }
}

// Display planner meals in planner.html
function displayPlanner() {
    const plannerContainer = document.getElementById('planner-container');
    const planner = JSON.parse(localStorage.getItem('mealPlanner')) || [];
    plannerContainer.innerHTML = '';

    if (planner.length === 0) {
        plannerContainer.innerHTML = '<p>No meals in your planner yet.</p>';
        return;
    }

    planner.forEach((meal, index) => {
        const mealElement = document.createElement('div');
        mealElement.classList.add('planner-item');
        mealElement.innerHTML = `
            <img src="${meal.thumbnail}" alt="${meal.name}">
            <h3>${meal.name}</h3>
            
            <button class="remove-btn" onclick="removeMealFromPlanner(${index})">Remove</button>
        `;
        plannerContainer.appendChild(mealElement);
    });
}

// Display favorite meals in favorite.html
function displayFavorites() {
    const favoritesContainer = document.getElementById('favorites-container');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesContainer.innerHTML = '';

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>No favorite meals yet.</p>';
        return;
    }

    favorites.forEach((meal, index) => {
        const mealElement = document.createElement('div');
        mealElement.classList.add('favorite-item');
        mealElement.innerHTML = `
            <img class="img2" src="${meal.thumbnail}" alt="${meal.name}">
            <h3>${meal.name}</h3>
            <button class="remove-btn" onclick="removeFavorite(${index})">Remove</button>
        `;
        favoritesContainer.appendChild(mealElement);
    });
}

// Buang meal dari planner
function removeMealFromPlanner(index) {
    let planner = JSON.parse(localStorage.getItem('mealPlanner')) || [];
    planner.splice(index, 1);
    localStorage.setItem('mealPlanner', JSON.stringify(planner));
    displayPlanner();
}

// Buang meal dari favorites
function removeFavorite(index) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

// Fetch random meal and display 
async function fetchRandomMeal() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await response.json();
        const meal = data.meals[0];
        openModal(meal);
    } catch (error) {
        console.error('Error fetching random meal:', error);
        alert('Failed to fetch a random meal. Please try again.');
    }
}


// Initialize planner and favorites on their respective pages
if (document.getElementById('planner-container')) {
    window.onload = displayPlanner;
}
if (document.getElementById('favorites-container')) {
    window.onload = displayFavorites;
}

// Add grocery item to the list and store it in LocalStorage
function addGroceryItem() {
    const groceryInput = document.getElementById('groceryInput').value.trim();
    if (!groceryInput) {
        alert('Please enter a grocery item.');
        return;
    }

    // Retrieve the current list from LocalStorage or initialize an empty array
    let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

    // Add the new item to the list
    groceryList.push(groceryInput);

    // Save the updated list back to LocalStorage
    localStorage.setItem('groceryList', JSON.stringify(groceryList));

    // Clear the input field
    document.getElementById('groceryInput').value = '';
    displayGroceryList();
}

// Display the grocery list on the page
function displayGroceryList() {
    const groceryListContainer = document.getElementById('grocery-list');
    const groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
    
    // Clear the container before re-populating
    groceryListContainer.innerHTML = '';

    if (groceryList.length === 0) {
        groceryListContainer.innerHTML = '<center><p>Your grocery list is empty.</p></center>';
        return;
    }

    // Render each item with "Update" and "Remove" buttons
    groceryList.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('grocery-item');
        itemElement.innerHTML = `
            <p id="item-text-${index}">${item}</p>
            <input type="text" id="edit-input-${index}" class="edit-input" value="${item}" style="display:none;">
            <div class="item-buttons">
                <button class="edit-btn" onclick="editGroceryItem(${index})">Edit</button>
                <button class="save-btn" onclick="saveGroceryItem(${index})" style="display:none;">Save</button>
                <button class="remove-btn" onclick="removeGroceryItem(${index})">Remove</button>
            </div>
        `;
        groceryListContainer.appendChild(itemElement);
    });
}

// Enter edit mode for a specific grocery item
function editGroceryItem(index) {
    // Show input field and "Save" button, hide the text and "Edit" button
    document.getElementById(`item-text-${index}`).style.display = 'none';
    document.getElementById(`edit-input-${index}`).style.display = 'inline';
    document.querySelectorAll('.save-btn')[index].style.display = 'inline';
    document.querySelectorAll('.edit-btn')[index].style.display = 'none';
}

// Save the updated grocery item
function saveGroceryItem(index) {
    let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
    const newValue = document.getElementById(`edit-input-${index}`).value.trim();

    if (newValue !== '') {
        groceryList[index] = newValue; // Update the item with the new value
        localStorage.setItem('groceryList', JSON.stringify(groceryList)); // Save the updated list

        // Refresh the displayed list to apply changes
        displayGroceryList();
    } else {
        alert('Item cannot be empty!');
    }
}



// Save grocery list to a text file
function saveIngredientsToFile() {
    const groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
    
    if (groceryList.length === 0) {
        alert("No ingredients to save.");
        return;
    }

    // Join all items in groceryList array into a single string, separated by new lines
    const ingredientsText = groceryList.join('\n');
    const blob = new Blob([ingredientsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Ingredients.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


// Remove a specific item from the grocery list
function removeGroceryItem(index) {
    let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
    groceryList.splice(index, 1); // Remove the selected item
    localStorage.setItem('groceryList', JSON.stringify(groceryList)); // Save updated list
    displayGroceryList(); // Refresh the display
}

// Clear the entire grocery list
function clearGroceryList() {
    localStorage.removeItem('groceryList'); // Remove from LocalStorage
    displayGroceryList(); // Refresh the display
}

// Initialize grocery list display on page load
if (document.getElementById('grocery-list')) {
    window.onload = displayGroceryList;
}
