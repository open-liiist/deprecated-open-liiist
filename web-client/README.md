# Liiist Web Client

## Development

First, run the development server and the necessary services:

```bash
docker compose build && docker compose up db auth-service web-client
```

* `db` is a PostgreSQL database.
* `auth-service` is a service that provides authentication.
* `web-client` is the Next.js web client.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `/src/app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

# **README - liiist Front-end Documentation**

---

### **1. Project Overview**

**liiist** is a Next.js-based front-end application designed to help users optimize their grocery shopping experience by providing both convenience and cost-effective solutions. The application includes features such as creating shopping lists, selecting locations, and using modes for either savings or convenience.

This documentation provides an overview of the app's architecture, page routes, components, and how to get started with development.

---

### **2. Directory Structure**

Below is the main directory structure of the **liiist frontend** repository from src directory:

```
├── app
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── layout.tsx
│   ├── [locale]
│   │   ├── layout.tsx
│   │   ├── (liiist)
│   │   │   ├── convenience-mode
│   │   │   │   ├── page.tsx
│   │   │   │   └── styles
│   │   │   │       └── ConvenienceMode.module.css
│   │   │   ├── dashboard
│   │   │   │   └── page.tsx
│   │   │   ├── home
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── (list)
│   │   │   │   ├── edit-list
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── new-list
│   │   │   │   │   └── page.tsx
│   │   │   │   └── shopping-list
│   │   │   │       └── [id]
│   │   │   │           ├── page.tsx
│   │   │   │           └── styles
│   │   │   │               └── ShoppingList.module.css
│   │   │   ├── position
│   │   │   │   ├── page.tsx
│   │   │   │   └── styles
│   │   │   │       └── LocationSelection.module.css
│   │   │   └── savings-mode
│   │   │       ├── page.tsx
│   │   │       └── styles
│   │   │           └── SavingsMode.module.css
│   │   ├── (login)
│   │   │   ├── actions.ts
│   │   │   ├── _login.tsx
│   │   │   ├── sign-in
│   │   │   │   └── page.tsx
│   │   │   └── sign-up
│   │   │       └── page.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   ├── profile
│   │   │   └── page.tsx
│   │   └── [...rest]
│   │       └── page.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   └── robots.txt
├── components
│   ├── map
│   │   └── Map.tsx
│   └── ui
│       ├── ActionButton.tsx
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── fonts.ts
│       ├── input.tsx
│       ├── label.tsx
│       ├── ListCard.tsx
│       ├── ListOfListComponents.tsx
│       ├── ProductList.module.css
│       ├── ProductList.tsx
│       ├── SetLocationLink.tsx
│       ├── tag-input.tsx
│       ├── ToggleSwitch.module.css
│       └── ToggleSwitch.tsx
├── config
│   ├── environments
│   │   ├── development.ts
│   │   ├── production.ts
│   │   └── test.ts
│   ├── environment.ts
│   ├── factories
│   │   └── configFactory.ts
│   ├── logger.ts
│   └── schemas
│       └── configSchema.ts
├── i18n
│   ├── request.ts
│   └── routing.ts
├── lib
│   ├── api.ts
│   ├── language.ts
│   └── utils.ts
├── middleware.ts
├── pages
│   └── api
│       ├── calculate-list.ts
│       ├── database.ts
│       ├── list-result.ts
│       ├── nearby-supermarkets.ts
│       ├── shopping-lists
│       │   └── [id].ts
│       ├── shoppingLists.json
│       ├── shopping-lists.ts
│       └── supermarkets.ts
├── routes.ts
├── services
│   ├── auth
│   │   ├── index.tsx
│   │   ├── middleware.ts
│   │   └── session.ts
│   ├── pathname.ts
│   ├── shoppingListService.ts
│   └── user.ts
└── types
    ├── generic-props.d.ts
    ├── i18n.d.ts
    └── user.d.ts
```

The directory structure contains distinct folders for different application parts, such as **pages**, **components**, **services**, and configuration files. Each section is explained in detail below.

---

### **3. Page Structure (Routes)**

#### **User Page (**\`\`**home**\*\*)\*\*

- **Status**: done
- **Description**: Displays saved shopping lists for the user.
- **Features**:
  - View, create, and delete shopping lists.
  - Navigation to user profile and list-specific settings.

#### **Location Selection Page (********`/position`********\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)**

- **Status**: almost done
- **Description**: Allows users to select their location either automatically or manually.
- **Features**:
  - Interactive map with Google Maps API.
  - Manual location entry with address suggestions using Google Places API.
  - **Work In Progress**: Updating supermarket markers dynamically based on the map's visible area.

#### **New List (********`/list/new-list`********\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)**

- **Status**: done
- **Description**: Enables users to create new shopping lists.
- **Features**:
  - Set list name.
  - Add products using a `tag-input` component.
  - Choose a mode between Convenience/Savings.
  - Set product quantities (e.g., "Pasta Barilla x2").
  - Calculate estimated costs via `/api/calculate-list`.

#### **Edit List (********`/list/edit-list`********\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)**

- **Status**: done
- **Description**: Enables users to edit a list.
- **Features**:
  - Change list name.
  - Add products using a `tag-input` component.
  - Choose a mode between Convenience/Savings.
  - Set product quantities (e.g., "Pasta Barilla x2").
  - Calculate estimated costs via `/api/calculate-list`.

#### **Shopping List (********`/list/shopping-list/[id]`********\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)**

- **This page are now deprecated.**
- **Status**: done
- **Description**: Displays and allows editing of a specific shopping list.
- **Features**:
  - Modify products in the list and adjust quantities.
  - **New Feature**: Delete products directly from the list.

#### **Convenience Mode (********`/liiist/convenience-mode`********\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)**

- **Status**: Work In Progress
- **Description**: Shows a single recommended supermarket, optimizing for convenience.
- **Features**:
  - Displays recommended products with total cost.
  - Support for quantity-based visualizations.

#### **Savings Mode (********`/liiist/savings-mode`********\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)**

- **Status**: Work In Progress 
- **Description**: Splits shopping lists across multiple supermarkets for optimal savings.
- **Features**:
  - Calculate total potential savings.
  - Display products sorted by supermarket with corresponding costs.

#### **Supermarket Page (********`/supermarket/[supermarketId]`********\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)**

- **Status**: Not Implemented
- **Description**: Provides detailed information about a specific supermarket.

#### **User Profile (********`/profile`********\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*)**

- **Status**: Work In Progress
- **Description**: Manages user information, saved lists, and user settings.

---

### **4. Components**

- **`tag-input.tsx`**: Component for adding products to a list with specific quantities.

  - **Features**: Dynamic addition, modification, and deletion of tags.

- **`Map.tsx`**: Displays Google Maps with supermarket markers.

  - **Features**: Interactive markers, integrated with Google Maps API.

- **`ToggleSwitch.tsx`**: Toggle to switch between "Risparmio" (Savings) and "Comodità" (Convenience) modes.

- **`ProductList.tsx`**: Displays products within a list.

  - **Features**: Edit quantities, delete items.

- **`ListCard.tsx`**: A card component to display a summary of a shopping list.

- **`ListOfLists.tsx`**: Maps an array of shopping lists and displays them on the home page.

---

### **5. API Integration**

- **API Endpoints**:
  - `/api/shopping-lists`: Handles user shopping lists.
  - `/api/shopping-lists/[id]`: Retrieve, modify, or delete a specific shopping list.
  - `/api/calculate-list`: Calculates the estimated cost of a shopping list.
  - `/api/nearby-supermarkets`: Retrieves supermarkets based on location selection.
  - `http://localhost:3001/supermarkets`: JSON Server endpoint for supermarket data (for testing).

---

### **6. Style Guide**

A global font and color palette have been chosen for the application to maintain visual consistency. Below are the key styling guidelines:

- **Global Font**: The chosen font is `Noto Sans JP`. Titles use the `bold` specification, while no `thin` variants are allowed.
- **Color Palette**: All text, except placeholders, should use the color `#333333` to ensure readability and uniformity.
- **Rounded Elements**: All elements should have the Tailwind class `rounded-lg` to maintain consistent rounded corners across the UI.
- **Shadows**: Elements that need to stand out from the background should use the class `shadow-md` for subtle elevation.
- **Card Width**: The maximum width for cards should be `2xl`.
- to avoid .svg file all the icon are imported from react icon.

### **6. Technologies Used**

- **Framework**: Next.js for server-side rendering and React components.
- **Libraries**:
  - **`@react-google-maps/api`**: Google Maps integration for interactive maps.
  - **Google Places API**: Location autocomplete and suggestions.
  - **CSS Modules**: Modular styles for component-specific CSS.
- **Database**: JSON Server for testing data storage.

---

### **7. How to Run the Project without Docker**

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Configure Environment Variables**:

   - Create a `.env` file with the necessary configurations (e.g., API keys) or remove the `.*` suffix.


3. **Start JSON Server** (for local supermarket data):

   ```bash
   json-server --watch db.json --port 3001
   ```

4. **Start the Application**:

   ```bash
   npm run dev
   ```

   The application will be accessible at [http://localhost:3000](http://localhost:3000).

---



### **9. Pending Feature Work**

- **Profile Page**: Styles are not yet complete.
- **Convenience Mode Page**: Styles are not yet complete.
- **Savings Mode Page**: Styles are not yet complete.

---

**Last Updated**: December 2, 2024


