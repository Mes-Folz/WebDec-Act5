# Ace — final project tasks

## Ownership: home page and shared navigation

- [x] Update `index.html` with the café brand, a clear headline and introduction, the existing banner image, and working menu/contact calls to action.
- [x] Add a consistent shared header, navigation, footer, and navigation styles across all six pages. Use the existing palette and Fraunces/Work Sans font choices for the shared navigation.
- [x] Add a JavaScript mobile menu across all pages with keyboard operation, visible focus, an accessible label, an accurate expanded state, and Escape-to-close behavior.
- [x] Add a working light/dark toggle across all pages.
- [ ] Compare the Home implementation with the exact Figma frames and coordinate the final visual decisions with the team. Figma requires sign-in, so the frames could not be inspected.
- [ ] Finish responsive checks for every page's full content and fix remaining overflow findings.

Completed checks so far: the navigation and theme controls were browser-tested on all six pages at 390px; no Home-page overflow was found at 320px. Existing page-content overflow remains on About and Products at 320px and Order at 768px. Shared stylesheet changes still need team review.

## Detailed implementation

Design references: [Home](https://www.figma.com/design/EvxbbSLl3QDe9PZmQImDUu/Sa-Poste-redesign?node-id=1-26) and [dark Home](https://www.figma.com/design/EvxbbSLl3QDe9PZmQImDUu/Sa-Poste-redesign?node-id=54-2).

- [ ] Inspect the full Home frame and reproduce its exact sections, typography, spacing, imagery and button destinations. The Figma file requires sign-in; current Home changes follow the written requirements and existing project content, not a frame-by-frame comparison.
- [x] Include the brand, headline, introduction, existing café imagery and working calls to action in `index.html`.
- [ ] Review and agree on shared styles with the group. A shared navigation stylesheet is in place; team review is still needed.
- [x] Link all six main pages in the shared navigation, mark the current page, and implement/test the accessible mobile menu.
- [ ] Complete desktop, tablet and mobile checks for all page content. Initial browser checks found the overflow issues listed above.
- [x] Implement and browser-test the light/dark theme control on all six pages. Coordinate the Figma dark-frame design with the team separately.
- [ ] Share the feature explanation, sources and checks with Mesiah and prepare to demonstrate and explain the code.

## Shared project requirements

- [x] Implement the Home and shared navigation changes using HTML, CSS and vanilla JavaScript; no interface framework or library was added.
- [ ] Treat the Figma frames as the design target, adapting them for desktop, tablet and mobile. Coordinate shared files before editing.
- [ ] Verify business information and prices; do not invent claims. Obtain permission where necessary and record image, font, icon and AI sources.
- [ ] Finish the full accessibility, contrast, asset optimization and responsive review. The shared navigation has visible focus and keyboard checks; remaining checks are not complete.
- [ ] Understand and be able to explain and modify your work; AI can assist with brainstorming, explanations and debugging, but the team must independently implement and understand its submission.

## Shared requirements

- [ ] Use semantic HTML5, CSS3, and vanilla JavaScript; no front-end or CSS frameworks or UI libraries.
- [ ] Follow the relevant Figma design and coordinate shared styles and files before editing.
- [ ] Make the work usable on mobile, tablet, and desktop; check keyboard focus, labels, contrast, and meaningful image alt text.
- [ ] Verify business details and prices; do not invent claims. Record asset sources and AI assistance.
- [ ] Review your changes with the team and be ready to explain your code during the presentation.

Figma: https://www.figma.com/design/EvxbbSLl3QDe9PZmQImDUu/Sa-Poste-redesign?node-id=0-1

The assignment requires four distinct pages, working navigation and form validation, and at least two more working interactive features. All features must actually work.
