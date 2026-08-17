# Accessibility Manual Testing Guide - Task 20.3

## Overview
This guide provides step-by-step instructions for manually verifying WCAG AA accessibility compliance for the Skill Chatbot Assistant feature.

**Requirements Validated**: 9.1 (Dialog Close Functionality), 9.5 (Keyboard Navigation & Accessibility)

---

## Prerequisites

### Required Tools

#### Color Contrast Analysis
1. **Chrome DevTools** (Built-in)
   - Press F12 → Elements tab → Styles panel → Click color swatch
   - View contrast ratio automatically

2. **axe DevTools Extension**
   - Install: https://www.deque.com/axe/devtools/
   - Free for basic accessibility testing
   - Provides comprehensive WCAG compliance reports

3. **WAVE Browser Extension**
   - Install: https://wave.webaim.org/extension/
   - Visual feedback on accessibility issues
   - Color contrast checker included

4. **Contrast Checker** (WebAIM)
   - Online tool: https://webaim.org/resources/contrastchecker/
   - Manual color contrast verification

#### Screen Reader Tools
- **Windows**: NVDA (free) or JAWS (commercial)
  - NVDA Download: https://www.nvaccess.org/download/
- **macOS**: VoiceOver (built-in)
  - Activate: Cmd + F5
- **iOS**: VoiceOver (built-in)
  - Activate: Settings → Accessibility → VoiceOver
- **Android**: TalkBack (built-in)
  - Activate: Settings → Accessibility → TalkBack

---

## Part 1: Keyboard Navigation Testing

### Test 1.1: Dialog Opening and Focus Management

**Steps**:
1. Open the student portal in a browser
2. Navigate to a skill using Tab key
3. Press Enter or Space to activate the skill
4. Verify dialog opens and focus moves into the dialog

**Expected Results**:
- ✓ Dialog opens when skill is activated
- ✓ Focus automatically moves to first focusable element in dialog
- ✓ Screen reader announces dialog title
- ✓ Background content is not accessible via Tab

**WCAG Success Criteria**: 2.1.1 (Keyboard), 2.4.3 (Focus Order)

---

### Test 1.2: Tab Navigation Through Interactive Elements

**Steps**:
1. With dialog open, press Tab key repeatedly
2. Observe focus indicator moving through elements
3. Note the tab order sequence

**Expected Tab Order**:
1. Close button (top-right X icon)
2. First response option button
3. Second response option button
4. Third response option button
5. (Focus cycles back to close button)

**Expected Results**:
- ✓ All interactive elements are reachable via Tab
- ✓ Focus order is logical (top to bottom, right to left for RTL)
- ✓ Focus indicators are clearly visible (ring outline)
- ✓ Focus does not leave the dialog (focus trap)

**WCAG Success Criteria**: 2.1.1 (Keyboard), 2.4.3 (Focus Order), 2.4.7 (Focus Visible)

---

### Test 1.3: Shift+Tab Reverse Navigation

**Steps**:
1. Tab to the last response option
2. Press Shift+Tab to navigate backward
3. Verify reverse tab order

**Expected Results**:
- ✓ Shift+Tab navigates in reverse order
- ✓ Focus indicators remain visible
- ✓ Tab order reverses correctly

**WCAG Success Criteria**: 2.1.1 (Keyboard), 2.4.3 (Focus Order)

---

### Test 1.4: Escape Key Dialog Close

**Steps**:
1. With dialog open, press Escape key
2. Verify dialog closes

**Expected Results**:
- ✓ Dialog closes when Escape is pressed
- ✓ Focus returns to the skill container that opened the dialog
- ✓ No JavaScript errors in console

**WCAG Success Criteria**: 2.1.1 (Keyboard)
**Validates Requirement**: 9.5

---

### Test 1.5: Enter/Space Key Activation

**Steps**:
1. Open dialog and Tab to a response option button
2. Press Enter key
3. Verify button activates

**Repeat with Space key**:
1. Open dialog again
2. Tab to a different response option
3. Press Space key
4. Verify button activates

**Expected Results**:
- ✓ Enter key activates focused button
- ✓ Space key activates focused button
- ✓ Student message appears after activation
- ✓ Loading state displays briefly
- ✓ Next AI response appears

**WCAG Success Criteria**: 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value)

---

### Test 1.6: Keyboard Trap Prevention

**Steps**:
1. Open dialog
2. Press Tab repeatedly (more than 10 times)
3. Verify focus cycles within dialog but doesn't escape
4. Press Escape to close dialog
5. Verify focus returns to page

**Expected Results**:
- ✓ Focus cycles through dialog elements
- ✓ Focus never escapes to background content
- ✓ Focus never becomes trapped on one element
- ✓ Escape key provides exit path

**WCAG Success Criteria**: 2.1.2 (No Keyboard Trap)

---

## Part 2: Focus Indicator Verification

### Test 2.1: Close Button Focus Indicator

**Steps**:
1. Open dialog
2. Tab to close button (or click dialog to ensure it's in focus)
3. Verify focus indicator appears

**Expected Results**:
- ✓ Focus ring appears around close button
- ✓ Ring color contrasts with background (recommended: 3:1 ratio)
- ✓ Ring width is at least 2px
- ✓ Ring is offset from button edge

**Visual Check**:
- Focus ring should be visible and distinctive
- Color: Should use theme's `ring` color (typically blue or primary color)
- Style: Solid ring, 2px width, 2px offset

**WCAG Success Criteria**: 2.4.7 (Focus Visible)

---

### Test 2.2: Response Button Focus Indicators

**Steps**:
1. Wait for response options to appear
2. Tab through each response button
3. Verify focus indicator on each

**Expected Results**:
- ✓ Each button shows focus ring when focused
- ✓ Focus rings are consistent across all buttons
- ✓ Ring persists until focus moves away
- ✓ Hover and focus states are distinct

**Visual Check**:
- All buttons should have identical focus indicators
- Focus ring should not be covered by other elements

**WCAG Success Criteria**: 2.4.7 (Focus Visible)

---

### Test 2.3: Focus Visibility During Animations

**Steps**:
1. Open dialog and immediately start pressing Tab
2. Verify focus indicators visible during fade-in animation
3. Click a response option
4. Tab during loading state
5. Verify focus indicators remain visible

**Expected Results**:
- ✓ Focus indicators visible during dialog fade-in
- ✓ Focus indicators visible during element animations
- ✓ Disabled buttons show focus but don't activate
- ✓ No flickering or disappearing focus rings

**WCAG Success Criteria**: 2.4.7 (Focus Visible)

---

## Part 3: Color Contrast Verification (WCAG AA)

### WCAG AA Contrast Requirements
- **Normal text** (< 18pt or < 14pt bold): 4.5:1 minimum
- **Large text** (≥ 18pt or ≥ 14pt bold): 3:1 minimum
- **UI components** (buttons, borders, icons): 3:1 minimum

### Test 3.1: Dialog Text Contrast

**Using Chrome DevTools**:
1. Open dialog
2. Press F12 → Elements tab
3. Inspect AI message text
4. Click the color swatch in Styles panel
5. View contrast ratio at bottom of color picker

**Elements to Check**:

| Element | Text Size | Required Ratio | Location |
|---------|-----------|----------------|----------|
| Dialog title | ~18-20px (large) | 3:1 | Top of dialog |
| AI message text | ~16px (normal) | 4.5:1 | Message bubbles |
| Student message text | ~16px (normal) | 4.5:1 | Message bubbles |
| Response button text | ~16px (normal) | 4.5:1 | Bottom of dialog |
| Loading state text | ~14px (normal) | 4.5:1 | Center of dialog |
| Timestamp text | ~12-14px (normal) | 4.5:1 | Below messages |

**Expected Results for Each**:
- ✓ Contrast ratio meets or exceeds requirement
- ✓ DevTools shows green checkmark (✓) for AA compliance
- ✓ Text is easily readable

**WCAG Success Criteria**: 1.4.3 (Contrast Minimum)

---

### Test 3.2: Button and UI Component Contrast

**Elements to Check**:

| Component | Element | Required Ratio |
|-----------|---------|----------------|
| Close button | Icon color vs background | 3:1 |
| Close button | Border vs background | 3:1 |
| Response buttons | Border vs background | 3:1 |
| Response buttons | Text vs button background | 4.5:1 |
| Focus indicators | Ring color vs background | 3:1 |
| Loading spinner | Icon color vs background | 3:1 |
| Message avatars | Icon color vs bubble | 3:1 |

**Using axe DevTools**:
1. Install axe DevTools extension
2. Open dialog
3. Click axe extension icon
4. Click "Scan ALL of my page"
5. Review "Contrast" issues in results

**Expected Results**:
- ✓ No contrast issues reported by axe
- ✓ All UI components meet 3:1 ratio
- ✓ All text meets 4.5:1 ratio (or 3:1 for large text)

**WCAG Success Criteria**: 1.4.3 (Contrast Minimum), 1.4.11 (Non-text Contrast)

---

### Test 3.3: Contrast in Different Themes

**If app supports dark/light themes**:
1. Test all contrast checks in light theme
2. Switch to dark theme
3. Repeat all contrast checks
4. Verify both themes meet requirements

**Expected Results**:
- ✓ Light theme meets all contrast requirements
- ✓ Dark theme meets all contrast requirements
- ✓ Focus indicators visible in both themes

---

## Part 4: Screen Reader Testing

### Test 4.1: Dialog Announcement (NVDA on Windows)

**Setup**:
1. Install NVDA from https://www.nvaccess.org/download/
2. Start NVDA (Ctrl+Alt+N)
3. Open browser and navigate to student portal

**Steps**:
1. Navigate to a skill using arrow keys
2. Press Enter to open dialog
3. Listen to NVDA announcements

**Expected Announcements**:
1. "Dialog" (announces dialog role)
2. "[Skill Title]" (announces dialog title)
3. "جاري تحضير المساعد..." (announces loading state)
4. (After loading) "[AI message content]" (announces first message)

**Expected Results**:
- ✓ Dialog role is announced
- ✓ Dialog title is announced clearly
- ✓ Loading state is announced
- ✓ Messages are announced as they appear
- ✓ Arabic text is pronounced correctly

**WCAG Success Criteria**: 4.1.2 (Name, Role, Value), 4.1.3 (Status Messages)

---

### Test 4.2: Navigation with Screen Reader

**Steps**:
1. With dialog open and NVDA running
2. Press Tab to move through elements
3. Listen to announcements for each element

**Expected Announcements**:
- Close button: "Close, button"
- Response option 1: "[Option text], button"
- Response option 2: "[Option text], button"
- Response option 3: "[Option text], button"

**Expected Results**:
- ✓ Each element is announced with its role
- ✓ Button labels are read in Arabic
- ✓ Disabled state is announced ("unavailable" or "dimmed")
- ✓ Focus position is always announced

**WCAG Success Criteria**: 4.1.2 (Name, Role, Value)

---

### Test 4.3: Dynamic Content Announcements

**Steps**:
1. Open dialog with NVDA running
2. Wait for initial AI message to complete
3. Press Tab to a response option
4. Press Enter to select it
5. Listen to announcements

**Expected Announcements**:
1. "[Selected option text]" (student message announced)
2. "Loading..." or "جاري التحميل..." (loading state)
3. "[AI response content]" (next AI message)

**Expected Results**:
- ✓ Student message is announced immediately
- ✓ Loading state is announced
- ✓ New AI message is announced when it appears
- ✓ Typing animation doesn't cause excessive announcements
- ✓ aria-live="polite" prevents interruption

**WCAG Success Criteria**: 4.1.3 (Status Messages)
**Validates Requirement**: 9.5 (aria-live region for dynamic content)

---

### Test 4.4: Typewriter Effect with Screen Reader

**Steps**:
1. Open dialog with NVDA running
2. Wait for AI message to start typing
3. Listen to how NVDA handles the animation

**Expected Behavior**:
- ✓ Full message is announced once (not character by character)
- ✓ Typing indicator announced: "جاري الكتابة" (while typing)
- ✓ No repeated announcements during animation
- ✓ aria-live="polite" prevents interruption

**If message is announced character-by-character** (ISSUE):
- Check `aria-atomic="false"` is set on conversation history
- Verify `aria-relevant="additions text"` is set
- Consider adding `aria-busy="true"` during typing

**WCAG Success Criteria**: 4.1.3 (Status Messages)

---

### Test 4.5: Message Role Announcements

**Steps**:
1. Navigate through messages with NVDA
2. Press Down Arrow to read message content
3. Listen for role announcements

**Expected Announcements**:
- AI Message: "article, رسالة من المساعد الذكي, [message content]"
- Student Message: "article, رسالة من الطالب, [message content]"

**Expected Results**:
- ✓ Each message has "article" role
- ✓ Arabic aria-label is announced
- ✓ Message content is announced
- ✓ Timestamps are announced (optional)

**WCAG Success Criteria**: 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value)

---

### Test 4.6: VoiceOver Testing (macOS)

**Setup**:
1. Press Cmd+F5 to enable VoiceOver
2. Open Safari or Chrome
3. Navigate to student portal

**Steps**:
1. Use VO+Right Arrow to navigate to skill
2. Press VO+Space to activate
3. Listen to announcements

**Expected Announcements**:
- Similar to NVDA test results
- All elements should be announced
- Arabic text should be pronounced

**Expected Results**:
- ✓ All elements accessible with VoiceOver
- ✓ Announcements similar to NVDA
- ✓ Gestures work on macOS

**WCAG Success Criteria**: 4.1.2 (Name, Role, Value)

---

## Part 5: Touch Target Size Verification (Mobile)

### Test 5.1: Response Button Touch Targets

**Setup**:
1. Open dialog on mobile device or use Chrome DevTools mobile emulation
2. Chrome DevTools: Press F12 → Click device icon → Select "iPhone SE" or similar

**Measurement Steps**:
1. Right-click response button → Inspect
2. In Computed tab, check dimensions
3. Verify minimum size

**Expected Dimensions**:
- ✓ Minimum height: 44px (WCAG 2.1 AAA: 44×44px)
- ✓ Minimum width: 44px
- ✓ Actual button has `min-h-[44px]` and `min-w-[44px]` classes
- ✓ Padding adds to comfortable touch area

**Expected Results**:
- ✓ All response buttons meet 44×44px minimum
- ✓ Buttons are easily tappable without zooming
- ✓ Adequate spacing between buttons (at least 8px gap)

**WCAG Success Criteria**: 2.5.5 (Target Size) - Level AAA

---

### Test 5.2: Close Button Touch Target

**Steps**:
1. Inspect close button in mobile view
2. Check computed dimensions

**Expected Dimensions**:
- ✓ Minimum height: 40px (exceeds WCAG AA: 24×24px)
- ✓ Minimum width: 40px
- ✓ Has `min-w-[40px]` and `min-h-[40px]` classes

**Expected Results**:
- ✓ Close button meets WCAG AA minimum (24×24px)
- ✓ Exceeds minimum for better usability
- ✓ Easy to tap without accidental activation

**WCAG Success Criteria**: 2.5.5 (Target Size)

---

### Test 5.3: Mobile Touch Interaction

**Steps**:
1. Open dialog on real mobile device (preferred) or emulator
2. Try tapping response buttons
3. Verify tactile feedback

**Expected Results**:
- ✓ Buttons respond immediately to tap
- ✓ Active state visible (button darkens when pressed)
- ✓ No accidental double-taps required
- ✓ Touch target extends to full button area

---

## Part 6: ARIA Attributes Verification

### Test 6.1: Dialog Role and Label

**Steps**:
1. Open dialog
2. Press F12 → Elements tab
3. Inspect dialog element (usually `<div role="dialog">`)

**Expected Attributes**:
```html
<div role="dialog" aria-labelledby="dialog-title" ...>
  <h2 id="dialog-title">مهارة الاختبار</h2>
  ...
</div>
```

**Expected Results**:
- ✓ `role="dialog"` is present
- ✓ `aria-labelledby` references title element
- ✓ Title has matching `id` attribute

**WCAG Success Criteria**: 4.1.2 (Name, Role, Value)

---

### Test 6.2: Aria-Live Region for Conversation History

**Steps**:
1. Open dialog
2. Inspect conversation history container
3. Verify aria-live attributes

**Expected Attributes**:
```html
<div 
  role="log"
  aria-live="polite"
  aria-atomic="false"
  aria-relevant="additions text"
>
  <!-- messages here -->
</div>
```

**Expected Results**:
- ✓ `role="log"` indicates sequential updates
- ✓ `aria-live="polite"` prevents interruptions
- ✓ `aria-atomic="false"` announces only changes
- ✓ `aria-relevant="additions text"` specifies what to announce

**WCAG Success Criteria**: 4.1.3 (Status Messages)
**Validates Requirement**: 9.5 (aria-live region for dynamic content)

---

### Test 6.3: Loading State Aria Attributes

**Steps**:
1. Open dialog (should show loading state initially)
2. Inspect loading state element

**Expected Attributes**:
```html
<div 
  role="status"
  aria-live="polite"
  aria-label="جاري تحضير المساعد..."
>
  <!-- loading animation -->
</div>
```

**Expected Results**:
- ✓ `role="status"` for loading announcements
- ✓ `aria-live="polite"` for screen readers
- ✓ `aria-label` with loading message text

**WCAG Success Criteria**: 4.1.3 (Status Messages)

---

### Test 6.4: Message Aria Labels

**Steps**:
1. Wait for AI message to appear
2. Inspect AI message element

**Expected Attributes for AI Message**:
```html
<div 
  role="article"
  aria-label="رسالة من المساعد الذكي"
  data-testid="ai-message"
>
  <!-- message content -->
</div>
```

**Expected Attributes for Student Message**:
```html
<div 
  role="article"
  aria-label="رسالة من الطالب"
  data-testid="student-message"
>
  <!-- message content -->
</div>
```

**Expected Results**:
- ✓ Each message has `role="article"`
- ✓ Arabic `aria-label` describes message role
- ✓ Avatar icons have `aria-hidden="true"`
- ✓ Decorative elements hidden from screen readers

**WCAG Success Criteria**: 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value)

---

### Test 6.5: Button Accessible Names

**Steps**:
1. Inspect close button
2. Verify screen reader text

**Expected Markup**:
```html
<button>
  <span class="sr-only">Close</span>
  <X className="h-4 w-4" />
</button>
```

**Expected Results**:
- ✓ Close button has `.sr-only` text "Close"
- ✓ Icon has no text alternative (decorative)
- ✓ Button purpose is clear to screen readers

**Repeat for Response Buttons**:
- ✓ Button text is visible (no sr-only needed)
- ✓ Arabic text is properly encoded

**WCAG Success Criteria**: 4.1.2 (Name, Role, Value)

---

## Part 7: Automated Accessibility Scanning

### Test 7.1: axe DevTools Scan

**Steps**:
1. Install axe DevTools extension
2. Open dialog
3. Click axe icon in browser toolbar
4. Click "Scan ALL of my page"
5. Review results

**Expected Results**:
- ✓ 0 Critical issues
- ✓ 0 Serious issues
- ✓ Minor issues (if any) documented and acceptable
- ✓ All issues in "Needs Review" category verified manually

**Common Acceptable Issues**:
- Color contrast warnings for decorative elements (can ignore if truly decorative)
- "Ensure ARIA attributes are valid" - verify manually

---

### Test 7.2: WAVE Extension Scan

**Steps**:
1. Install WAVE extension
2. Open dialog
3. Click WAVE icon
4. Review visual indicators

**WAVE Icons Guide**:
- 🟢 Green: Features (good accessibility features found)
- 🔴 Red: Errors (critical issues)
- 🟡 Yellow: Alerts (warnings to review)
- 🔵 Blue: Structural elements
- 🟣 Purple: Contrast errors

**Expected Results**:
- ✓ No red error icons
- ✓ Green icons for good ARIA usage
- ✓ Yellow alerts (if any) reviewed and documented
- ✓ All contrast ratios pass

---

## Summary Checklist

### Keyboard Navigation ✓
- [ ] Tab key navigates through all interactive elements
- [ ] Shift+Tab navigates in reverse
- [ ] Enter/Space activate buttons
- [ ] Escape closes dialog
- [ ] Focus returns to trigger after close
- [ ] No keyboard traps

### Focus Indicators ✓
- [ ] Close button has visible focus ring
- [ ] All response buttons have visible focus rings
- [ ] Focus indicators have sufficient contrast (3:1)
- [ ] Focus visible during animations

### Color Contrast (WCAG AA) ⚠ Manual Verification Required
- [ ] Dialog title text: ratio ≥ 3:1 (large text)
- [ ] AI message text: ratio ≥ 4.5:1
- [ ] Student message text: ratio ≥ 4.5:1
- [ ] Response button text: ratio ≥ 4.5:1
- [ ] Button borders: ratio ≥ 3:1
- [ ] Focus indicators: ratio ≥ 3:1
- [ ] Loading text: ratio ≥ 4.5:1

### Screen Reader Support ✓
- [ ] Dialog role announced
- [ ] Dialog title announced
- [ ] Loading state announced
- [ ] Messages announced as they appear
- [ ] Button labels announced correctly
- [ ] Typing indicator announced
- [ ] Dynamic content uses aria-live="polite"

### Touch Targets ✓
- [ ] Response buttons: 44×44px minimum
- [ ] Close button: 40×40px minimum (exceeds 24×24px requirement)
- [ ] Adequate spacing between buttons

### ARIA Attributes ✓
- [ ] Dialog has role="dialog"
- [ ] Conversation history has role="log" and aria-live="polite"
- [ ] Loading state has role="status"
- [ ] Messages have role="article" and aria-label
- [ ] Close button has sr-only text

### Automated Scanning ⚠ Manual Verification Required
- [ ] axe DevTools: 0 critical/serious issues
- [ ] WAVE: No error icons

---

## Issue Reporting Template

If you find accessibility issues during testing, document them using this template:

```markdown
### Issue: [Brief Description]

**WCAG Success Criterion**: [e.g., 1.4.3 Contrast Minimum]
**Severity**: [Critical / Serious / Moderate / Minor]

**Test**: [Which test revealed the issue]
**Location**: [Specific component or element]

**Expected Behavior**:
[What should happen according to WCAG]

**Actual Behavior**:
[What actually happens]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Screenshots/Evidence**:
[Attach screenshots, contrast ratio measurements, or screen reader output]

**Suggested Fix**:
[If known, suggest how to resolve the issue]
```

---

## Conclusion

This manual testing guide covers all aspects of WCAG AA accessibility compliance for the Skill Chatbot Assistant. Complete all sections and document any issues found.

**Estimated Testing Time**: 1.5 - 2 hours for comprehensive testing

**Priority Tests**:
1. Keyboard navigation (30 min)
2. Color contrast verification (20 min)
3. Screen reader testing (40 min)
4. ARIA attributes spot check (10 min)

**References**:
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- NVDA: https://www.nvaccess.org/
