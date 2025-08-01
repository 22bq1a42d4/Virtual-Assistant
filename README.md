# React URL Shortener

A modern, client-side URL shortener built with React and Material UI. Transform long URLs into short, shareable links with custom shortcodes, analytics tracking, and expiry dates.

![URL Shortener](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Material UI](https://img.shields.io/badge/Material--UI-5.11.10-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🌟 Features

### Core Functionality
- **URL Shortening**: Convert long URLs into short, manageable links
- **Custom Shortcodes**: Create memorable, branded short URLs with your own shortcodes
- **Batch Processing**: Shorten up to 5 URLs simultaneously
- **Expiry Dates**: Set validity periods for URLs (1 hour to 1 year)
- **Client-Side Only**: No external servers required - everything runs in your browser

### Analytics & Management
- **Click Tracking**: Monitor how many times your short URLs are accessed
- **Detailed Statistics**: Comprehensive analytics dashboard with filtering and sorting
- **URL Management**: View, search, filter, and delete your shortened URLs
- **Data Export**: Export your data as JSON for backup purposes
- **Expired URL Cleanup**: Automatically manage expired URLs

### User Experience
- **Material UI Design**: Clean, modern interface with responsive design
- **Real-time Validation**: Instant feedback on URL and shortcode validity
- **Copy to Clipboard**: One-click copying of shortened URLs
- **Loading States**: Smooth animations and loading indicators
- **Error Handling**: Robust error handling with user-friendly messages

### Technical Features
- **Concurrent Processing**: Efficient handling of multiple URL shortening requests
- **Local Storage**: All data stored securely in your browser
- **Logging Middleware**: Comprehensive logging for debugging and analytics
- **Progressive Web App**: Installable as a standalone application
- **Accessibility**: Built with accessibility best practices

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/react-url-shortener.git
   cd react-url-shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 📱 Usage

### Creating Short URLs

1. **Single URL**:
   - Enter a long URL in the input field
   - Optionally specify a custom shortcode (3-20 alphanumeric characters)
   - Optionally set an expiry period in hours
   - Click "Shorten URLs"

2. **Multiple URLs**:
   - Click "Add URL" to add up to 5 URL inputs
   - Fill in each URL with optional custom settings
   - Process all URLs at once

### Managing URLs

1. **View Statistics**:
   - Click "View Detailed Analytics" or use the Statistics navigation
   - View comprehensive analytics including click counts, creation dates, and status

2. **Search and Filter**:
   - Use the search bar to find specific URLs or shortcodes
   - Filter by status: All, Active, Expired, Permanent, or Expiring

3. **Export Data**:
   - Click "Export Data" to download your URLs and statistics as JSON

### URL Redirection

When someone visits a short URL:
1. The application looks up the original URL
2. Checks if the URL has expired
3. Increments the click counter
4. Shows a countdown before redirecting
5. Allows manual redirection or cancellation

## 🏗️ Architecture

### Project Structure

```
src/
├── components/
│   ├── ShortenerForm.jsx      # Main URL input form
│   ├── ShortenedURLCard.jsx   # Display component for shortened URLs
│   ├── StatisticsTable.jsx    # Analytics table with sorting/filtering
│   └── RedirectHandler.jsx    # Handles short URL redirections
├── pages/
│   ├── ShortenerPage.jsx      # Main application page
│   └── StatisticsPage.jsx     # Analytics and management page
├── utils/
│   ├── urlUtils.js           # URL validation and processing utilities
│   ├── storage.js            # localStorage management
│   └── loggerMiddleware.js   # Logging and error tracking
├── App.js                    # Main application component with routing
└── index.js                  # Application entry point
```

### Core Components

#### 1. **ShortenerForm**
- Handles up to 5 URL inputs
- Real-time validation for URLs, shortcodes, and validity periods
- Batch processing with error handling
- Material UI form components with responsive design

#### 2. **StatisticsTable**
- Sortable and filterable data table
- Real-time search functionality
- Bulk operations (cleanup, delete)
- Export capabilities

#### 3. **RedirectHandler**
- Processes short URL access
- Manages click tracking
- Handles expired URL scenarios
- Provides user-friendly redirect experience

#### 4. **Storage Management**
- Efficient localStorage operations
- Data validation and error handling
- Automatic cleanup of expired URLs
- Collision detection for custom shortcodes

### State Management

The application uses React's built-in state management:
- **Local Component State**: For form inputs and UI state
- **localStorage**: For persistent data storage
- **Context-free Architecture**: Simple prop passing for clean data flow

### Data Flow

1. **URL Creation**: Form → Validation → Storage → Display
2. **Analytics**: Storage → Processing → Display with filtering/sorting
3. **Redirection**: URL Access → Lookup → Validation → Redirect + Analytics

## 🛠️ Technical Implementation

### URL Validation
- Comprehensive regex patterns for URL validation
- Protocol normalization (adds https:// if missing)
- Domain validation and format checking

### Shortcode Generation
- Cryptographically random 6-character codes
- Collision detection and retry logic
- Custom shortcode validation (3-20 alphanumeric characters)

### Click Tracking
- Atomic increment operations
- Expiry checking before tracking
- Detailed access logging

### Error Handling
- Application-level error boundaries
- Graceful fallbacks for storage failures
- User-friendly error messages
- Comprehensive logging system

### Logging Middleware
- Structured logging with categories and levels
- Browser storage for log persistence
- Console output with styling
- Error aggregation and reporting

## 🎨 UI/UX Design

### Material UI Implementation
- **Theme Customization**: Custom color palette and typography
- **Responsive Design**: Mobile-first approach with breakpoints
- **Component Library**: Buttons, Cards, Tables, Forms, Icons
- **Accessibility**: ARIA labels, keyboard navigation, color contrast

### Key Components Used
- `TextField`: URL and shortcode inputs
- `Button`: Actions and navigation
- `Card`: Content organization
- `Table`: Data display with sorting
- `Chip`: Status indicators and filters
- `Alert`: Success and error messages
- `Dialog`: Confirmations and modals

### Design Principles
- **Consistency**: Unified spacing, colors, and typography
- **Clarity**: Clear labels, helpful tooltips, and status indicators
- **Efficiency**: Minimal clicks to accomplish tasks
- **Feedback**: Immediate visual feedback for all actions

## 📊 Data Management

### Local Storage Strategy
- **Key Namespacing**: Prefixed keys to avoid conflicts
- **Data Validation**: Schema validation for stored data
- **Error Recovery**: Graceful handling of corrupted data
- **Size Management**: Automatic cleanup to prevent storage limits

### Data Structure
```javascript
// URL Mapping
{
  shortcode: "abc123",
  originalUrl: "https://example.com/very-long-url",
  createdAt: "2024-01-01T12:00:00.000Z",
  expiryDate: "2024-01-02T12:00:00.000Z", // or null
  clickCount: 5
}

// Statistics
{
  totalUrls: 10,
  totalClicks: 50,
  activeUrls: 8,
  expiredUrls: 2
}
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Development/production mode
- Custom configurations can be added via `.env` files

### Browser Support
- Modern browsers with ES6+ support
- Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- Progressive enhancement for older browsers

### Storage Limits
- Typical localStorage limit: 5-10MB per domain
- Automatic cleanup when approaching limits
- Export functionality for data backup

## 🚀 Deployment

### Static Hosting
The application can be deployed to any static hosting service:

#### Netlify
```bash
npm run build
# Upload build folder to Netlify
```

#### Vercel
```bash
npm run build
npx vercel --prod
```

#### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d build
```

### Custom Domain Setup
1. Configure your hosting service for custom domain
2. Update any hardcoded URLs in the application
3. Set up HTTPS (required for modern browser features)

## 🧪 Testing

### Manual Testing Checklist
- [ ] URL validation with various formats
- [ ] Custom shortcode collision handling
- [ ] Expiry date functionality
- [ ] Click tracking accuracy
- [ ] Data export/import
- [ ] Responsive design across devices
- [ ] Browser compatibility

### Performance Testing
- [ ] Large dataset handling (1000+ URLs)
- [ ] Concurrent URL creation
- [ ] Search and filter performance
- [ ] Memory usage monitoring

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper documentation
4. Test thoroughly across different browsers
5. Submit a pull request with detailed description

### Code Style
- Follow React functional component patterns
- Use Material UI components consistently
- Implement proper error handling
- Add JSDoc comments for functions
- Follow the existing project structure

### Bug Reports
When reporting bugs, please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Sample URLs that cause issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the excellent React framework
- **Material UI Team**: For the comprehensive component library
- **Open Source Community**: For inspiration and best practices

## 📞 Support

For support, questions, or suggestions:
- Create an issue on GitHub
- Check existing issues for similar problems
- Refer to this README for common questions

---

**Made with ❤️ using React and Material UI**

