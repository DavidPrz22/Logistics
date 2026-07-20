### Create new combobox component to search for lotes in the backend

### Backend Instructions:

1. Define an endpoint to return a list of items
2. Query the database to find items that match the queries from the request, it can be by sku variants or variant product names
3. Define ODTs to validate incomming data
4. Handle errors 

### Frontend Instructions:

1. Modify the "/home/davidprz/projects/Logistics/frontend/logistics/src/components/shared/searchCombobox.tsx" component as a controlled React component that provides an interactive, searchable dropdown (combobox) for selecting lotes
2. Request data on the database based on users input
3. Define the returning types for lotes and update the features' types
4. Cache the data using tanstack query
5. Add debounce to the search, and minimum of 3 character to enable request
6. The data shown in the component will be queried data, display it as grouped by variant
7. Create useDebounce hook at the src level of the project
8. Maintain a local searchTerm state linked to a text input. It applies a 250ms debounce (useDebounce hook) to this search term to prevent excessive API calls while the user is typing.
9. On clicking an element, add the lote to the lotes list
10. Do not use erp global lotes, now we will use the data from the server. Just validate that if a user tries to add a lote thats already in the list, it wont be allowed
11. When adding the item to the list of lotes, price unit will be the same set as the base price of the variant
12. If the user want to modify quantity for that lote, validate the amount is available