# FDD Visuals Template Guidelines

This document outlines the essential guidelines and instructions for developing FDD Visuals projects using this modular template.

## Core Instructions
### Data Handling
* **Always use CSV files for data** - Never embed data directly in HTML files
* Store CSV files in the `/public` directory for easy access
* Use the built-in CSV parser utility for data processing
* Ensure CSV files follow consistent naming conventions

### Map Visualization (Mapbox)
* **All map dots must be contained within a bounding box**
* Configure map bounds in `template.config.json` under interactive settings
* Use appropriate zoom levels to ensure all data points are visible
* Test on different screen sizes to verify bounding box effectiveness

### Typography Consistency
All text elements must use the correct fonts:
* **URW DIN** for:
  * Headers and titles
  * Category badges
  * Navigation elements
  * Button labels
* **Lato** for:
  * Body text and descriptions
  * Form elements
  * Modal content
  * Footer text

### Responsive Design
* **Interactive components must be mobile-responsive**
* Use CSS Grid and Flexbox for layouts
* Test on mobile devices (320px minimum width)
* Ensure touch targets are at least 44px for mobile
* Implement responsive breakpoints:
  * Mobile: 320px - 768px
  * Tablet: 768px - 1024px
  * Desktop: 1024px+

### Deployment
* **Always use GitHub Pages branch deployment**
* Do NOT use GitHub Actions for deployment
* Use the `gh-pages` branch for hosting
* Configure deployment in `template.config.json`
* Ensure SEO files are properly generated during build

## General Development Guidelines

### Code Structure
* Only use absolute positioning when necessary
* Opt for responsive layouts using flexbox and grid by default
* Refactor code as you go to keep it clean and maintainable
* Keep file sizes small and put helper functions in separate files
* Use the modular component architecture provided by the template

### Component Guidelines
* All layout components (Header, Footer, Navigation, etc.) should remain consistent across projects
* Only customize the interactive container component for project-specific needs
* Use CSS Modules for styling to maintain modularity
* Follow the established folder structure in `/src`

### Configuration-Driven Development
* Use `template.config.json` as the single source of truth for project settings
* Update configuration instead of hardcoding values in components
* Leverage the template's configuration system for SEO, styling, and behavior

## Design System Guidelines

### Visual Hierarchy
* Use consistent spacing based on 8px grid system
* Maintain proper contrast ratios (WCAG AA compliance)
* Use the established color palette from the configuration

### Interactive Elements
* Ensure all interactive elements have proper hover and focus states
* Use consistent button styles across the application
* Implement loading states for data-driven components

### Accessibility
* Include proper ARIA labels for interactive elements
* Ensure keyboard navigation works throughout the application
* Test with screen readers when possible
* Maintain semantic HTML structure

## SEO Requirements
* Use the enhanced SEO system provided by the template
* Configure SEO metadata in `template.config.json`
* Ensure structured data is properly implemented
* Test SEO using the built-in validation tools

## Testing and Quality Assurance
* Test on multiple devices and browsers
* Verify CSV data loading works correctly
* Check map bounding box functionality
* Validate responsive design at all breakpoints
* Ensure typography consistency across all components

---

**Remember**: This template is designed for modularity and consistency. Follow these guidelines to maintain the quality and standardization of FDD Visuals projects.
 
--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
