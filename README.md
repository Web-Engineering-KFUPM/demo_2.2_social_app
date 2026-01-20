# Simple Social Media Page (HTML Only)

## Overview
This demo guides you to build a simple social media page using only HTML (with optional CSS provided). You will practice page containers, navigation links, and accessible forms while following a clear checklist.

## What You'll Create
A single-page, HTML-only mini app featuring:
- A main container that wraps the entire page
- A header section
- A navigation area with internal anchors and an external link
- A posts list where each post is wrapped in its own container
- A create-post form with proper labels, ids, names, placeholders, and required fields
- A footer section

## Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code, Sublime Text, Notepad++)
- Basic understanding of HTML structure

## Files
- `index.html`: Starter file with TODOs in comments
- `styles.css`: Optional stylesheet for nicer visuals

## Instructions

> **Note:**  
> Please follow the steps strictly to gain good marks in the assignment.  
>  
> **Due Date:** 21 Jan, 2026, **11:59 PM**

### Step 1: Start from the Starter File
1. Open `index.html` in your editor.
2. Skim the top comment block to see the submission checklist.

### Step 2: Add the Main Page Container
1. Add one main container that wraps the entire page content (open it near the top and close it at the very end):
   ```html
   <div id="app">
     <!-- page content here -->
   </div>
   ```

### Step 3: Wrap the Header
1. Wrap the header text (`<h1>`, description `<p>`) in a semantic `<header>` or a `<div>`:
   ```html
   <header>
     <h1>Simple Social Media - Starter</h1>
     <p>This is a starter. Finish the TODOs in comments to complete the page.</p>
   </header>
   ```

### Step 4: Create Navigation Links
1. Add a small nav container with three internal links to anchors on the page: `#home`, `#create`, `#about`.
2. Add one external link to the HTML docs that opens in a new tab using `target="_blank"`.
   ```html
   <div class="nav">
     <a href="#home">Home</a>
     <a href="#create">Create</a>
     <a href="#about">About</a>
     <a href="https://developer.mozilla.org/en-US/docs/Web/HTML" target="_blank">HTML Docs</a>
   </div>
   ```

### Step 5: Wrap Each Post
1. For each post (author `<h4>` + message `<p>`), wrap the pair in its own container:
   ```html
   <div class="post">
     <h4>John Smith</h4>
     <p>Hello! This is my first post in this class.</p>
   </div>
   ```

### Step 6: Complete the Form
1. Make the `<form>` use `action="#"` and `method="post"`.
2. Connect labels to inputs using matching `for` and `id`.
3. Add `name` and `placeholder` attributes.
4. Make both fields required.
5. Ensure the submit button has `type="submit"`.
   ```html
   <form action="#" method="post" class="card">
     <div class="form-group">
       <label for="name">Your Name:</label>
       <input id="name" name="name" type="text" placeholder="Your name" required>
     </div>

     <div class="form-group">
       <label for="message">Your Post:</label>
       <textarea id="message" name="message" rows="4" placeholder="Write your post..." required></textarea>
     </div>

     <!-- Optional extras -->
     <div class="form-group">
       <label for="title">Title (optional):</label>
       <input id="title" name="title" type="text" placeholder="Post title">
     </div>
     <div class="form-group">
       <label for="category">Category (optional):</label>
       <select id="category" name="category">
         <option value="">Select a category</option>
         <option value="personal">Personal</option>
         <option value="school">School</option>
         <option value="fun">Fun</option>
       </select>
     </div>

     <button type="submit" class="btn">Post</button>
   </form>
   ```

### Step 7: Add a Footer
1. Optionally wrap the footer text in a semantic `<footer>` or a `<div>`:
   ```html
   <footer>
     <p>© 2024 Web Fundamentals</p>
   </footer>
   ```

### Step 8: Link the Stylesheet (Optional but Recommended)
1. In the `<head>` of `index.html`, link the provided CSS file:
   ```html
   <link rel="stylesheet" href="styles.css">
   ```

### Step 9: View Your Page
1. Save `index.html`.
2. Open your browser.
3. Drag and drop `index.html` into the browser window, or right-click → Open With → your browser.

## Submission Checklist (Match the Starter TODOs)
1) One main container wraps the entire page
2) Header is wrapped in a container
3) Each post is wrapped in its own container
4) Nav container has internal links to `#home`, `#create`, `#about`
5) One external link opens in a new tab
6) Form uses `action="#"` and `method="post"`
7) Labels use `for=` and match inputs' `id=`
8) Inputs/textarea have proper `name` and `placeholder`
9) Both fields are `required`
10) Submit button has `type="submit"`
11) Footer wrapped (optional)
12) Main container closed at the end
13) External CSS linked in the `<head>`

## What You're Practicing

### Containers & Structure
- **Main container**: Wrap the entire UI
- **Section wrappers**: `header`, `div`, `footer`

### Links
- **Internal anchors**: `href="#section-id"`
- **External link**: Use `target="_blank"` to open in a new tab

### Forms & Accessibility
- **Labels and controls**: Pair `label[for]` with input/textarea `id`
- **Form basics**: `action`, `method`, `name`, `placeholder`, `required`

## Customization Ideas
- Add more posts and style them differently
- Add avatars or images beside posts
- Introduce categories/tags and filter links
- Add a character counter to the textarea (conceptually, without JS)
- Adjust styles in `styles.css` to make it your own

## Troubleshooting
- **No styles?** Ensure `<link rel="stylesheet" href="styles.css">` is in the `<head>`
- **Links not jumping?** Verify the target section has the correct `id` (`home`, `create`, `about`)
- **Form fields not required?** Check `required` is present on both the input and textarea
- **Labels not focusing inputs?** Confirm `for` matches the field `id`
- **Layout looks off?** Make sure containers are properly opened/closed

## Project Structure
```
demo_2.2_social_app/
├── index.html        # Starter with TODOs
├── styles.css            # Optional styling
└── README.md             # This instruction file
```

## Next Steps
- Try adding CSS enhancements or responsive tweaks
- Explore semantic HTML elements for sections and navigation
- Later, add JavaScript to actually submit and render posts

## HTML Resources
- **MDN Web Docs**: https://developer.mozilla.org/en-US/docs/Web/HTML
- **W3Schools HTML Tutorial**: https://www.w3schools.com/html/default.asp
- **HTML Element Reference**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element

Happy building! 🎉


