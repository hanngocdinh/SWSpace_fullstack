# SWSpace User Frontend

This project is a responsive landing page for SWSpace, a coworking space company. The landing page is built with React and follows modern web development practices.

## Project Structure

```
swspace-landing-page/
├── src/
│   ├── assets/
│   │   ├── images/ (place your images here)
│   │   └── fonts/ (place your fonts here)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── sections/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── TestimonialSection.jsx
│   │   │   ├── WhyChooseSection.jsx
│   │   │   ├── GallerySection.jsx
│   │   │   ├── CustomerExperienceSection.jsx
│   │   │   └── ContactSection.jsx
│   │   └── ui/ (reusable UI components)
│   ├── contexts/ (React contexts)
│   ├── hooks/ (custom React hooks)
│   ├── pages/ (for additional pages)
│   ├── styles/ (global styles)
│   └── utils/ (utility functions)
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── public/
    ├── index.html
    └── favicon.ico
```

## Features

- Responsive design that works on all devices
- Modern React components with styled-components
- Smooth scrolling navigation
- Interactive elements and animations
- Complete landing page with header, main sections, and footer

## Environment

Tạo file `.env` tại thư mục `frontend_user/`:

```
REACT_APP_API_URL=http://localhost:5000
```

## Installation

1. Clone this repository
2. Navigate to the project directory: `cd swspace-landing-page`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Backend hợp nhất chạy ở `http://localhost:5000`. Frontend sẽ gọi API dựa trên `REACT_APP_API_URL`.

## Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from create-react-app

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
