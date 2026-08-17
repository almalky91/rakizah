# Manual Testing Quick Start Guide

## Quick Access Checklist

This is a condensed version of the comprehensive testing guide for rapid manual testing.

---

## Setup (2 minutes)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the application:**
   - Navigate to: `http://localhost:5173/teacher/[teacherId]`
   - Find skill containers in the skills section

3. **Test environment:**
   - Modern browser (Chrome, Firefox, Safari, or Edge)
   - Optionally: Mobile device for mobile testing

---

## Critical Path Testing (10 minutes)

### Test 1: Basic Dialog Flow ✓
1. Click any skill container
2. Verify dialog opens with fade-in animation
3. Verify loading spinner appears with Arabic text "جاري تحضير المساعد..."
4. Wait 1-2 seconds for initial message
5. Verify AI message appears with typewriter effect (characters appear one by one)
6. Verify response buttons fade in after typing completes
7. Click first response button
8. Verify student message appears
9. Verify loading state appears briefly
10. Verify next AI message appears with typewriter
11. Complete conversation until closing message

**Expected Result:** Smooth conversation flow with no errors

### Test 2: Arabic RTL Layout ✓
1. Open chatbot dialog
2. Verify all text is right-aligned (RTL direction)
3. Verify AI messages align to the right side
4. Verify student messages align to the left side
5. Verify close button (X) is on the left side
6. Verify Arabic fonts are clear and readable
7. Verify response buttons have proper RTL alignment

**Expected Result:** Perfect RTL layout with readable Arabic text

### Test 3: Dialog Close ✓
1. Open dialog
2. Click close button (X) → Dialog closes smoothly
3. Open dialog again
4. Click outside dialog → Dialog closes
5. Open dialog again
6. Press Escape key → Dialog closes
7. Open dialog again and start conversation
8. Close during typewriter animation → No errors

**Expected Result:** All close methods work, no lingering state

### Test 4: Responsive Layout ✓
1. Open dialog on desktop (wide screen)
2. Verify dialog is centered with max-width ~600px
3. Resize browser to mobile width (< 640px)
4. Verify dialog occupies 95% of screen width
5. Verify response buttons stack vertically on narrow screen
6. Verify all text remains readable

**Expected Result:** Dialog adapts smoothly to screen size

### Test 5: Animation Quality ✓
1. Open dialog → Verify smooth fade-in (200ms)
2. Observe typewriter effect → Should feel natural, not too fast or slow
3. Watch response buttons appear → Smooth fade-in (150ms)
4. Click response → Watch transition to next message
5. Close dialog → Verify smooth fade-out (200ms)

**Expected Result:** All animations are smooth (60fps), no jank

---

## Edge Case Testing (5 minutes)

### Rapid Clicks Test ✓
- Rapidly click skill container multiple times → Only one dialog opens
- Click response button multiple times rapidly → Only one message added
- No console errors

### Close During Animation Test ✓
- Open dialog → Close immediately during loading → No errors
- Open dialog → Close during typewriter → Animation stops cleanly
- Reopen dialog → Fresh state, no leftover data

### "لم أفهم" Option Test ✓
- Find "لم أفهم" (I didn't understand) option
- Click it → Should loop back to same message
- Verify typewriter plays again
- Verify can continue conversation normally

---

## Browser-Specific Checks (5 minutes per browser)

### Chrome ✓
- [ ] Dialog works
- [ ] Typewriter smooth
- [ ] Arabic fonts clear
- [ ] No console errors

### Firefox ✓
- [ ] Dialog works
- [ ] Typewriter smooth
- [ ] Arabic fonts clear
- [ ] No console errors

### Safari (macOS/iOS) ✓
- [ ] Dialog works
- [ ] Typewriter smooth
- [ ] Arabic fonts clear (Safari has different text rendering)
- [ ] CSS animations work (-webkit- prefixes)

### Edge ✓
- [ ] Dialog works
- [ ] Typewriter smooth
- [ ] Arabic fonts clear
- [ ] No console errors

---

## Mobile-Specific Checks (5 minutes per device)

### iOS (iPhone/iPad) ✓
- [ ] Dialog occupies 95% of screen width
- [ ] Touch targets are adequate (buttons easy to tap)
- [ ] Typewriter animation smooth on device
- [ ] Can scroll conversation smoothly
- [ ] Close button easy to tap
- [ ] Arabic text readable without zooming

### Android ✓
- [ ] Dialog occupies 95% of screen width
- [ ] Touch targets are adequate
- [ ] Typewriter animation smooth
- [ ] Can scroll conversation smoothly
- [ ] System back button closes dialog (if applicable)
- [ ] Arabic text readable

---

## Accessibility Quick Check (5 minutes)

### Keyboard Navigation ✓
- [ ] Press Tab → Focus moves to close button
- [ ] Press Tab again → Focus moves to first response button
- [ ] Continue Tab → Focus cycles through all buttons
- [ ] Press Escape → Dialog closes
- [ ] Focus indicators are visible

### Screen Reader (Optional)
- [ ] Enable VoiceOver (Mac/iOS) or TalkBack (Android)
- [ ] Open dialog → Announces dialog opened
- [ ] Navigate to AI message → Reads message content
- [ ] Navigate to response buttons → Reads button labels
- [ ] Loading state announces "جاري تحضير المساعد..."

---

## Common Issues to Watch For

### Rendering Issues
- ❌ Text overlapping or cutting off
- ❌ Buttons too small to tap on mobile
- ❌ Scrollbar appearing incorrectly
- ❌ Arabic text displaying left-to-right instead of RTL
- ❌ Diacritics not rendering with base characters

### Animation Issues
- ❌ Jittery or laggy animations
- ❌ Typewriter effect too fast or too slow
- ❌ Dialog flickering during open/close
- ❌ Response buttons appearing before typewriter finishes

### State Management Issues
- ❌ Multiple dialogs opening at once
- ❌ Duplicate messages in conversation
- ❌ State persisting after dialog close
- ❌ Wrong conversation loading for different skills

### Console Errors
- ❌ JavaScript errors in browser console
- ❌ React warnings or errors
- ❌ Network errors (should be none - dummy data only)

---

## How to Report Issues

### Bug Report Template

**Title:** Brief description of the issue

**Severity:**
- 🔴 Critical (feature broken, cannot complete conversation)
- 🟠 High (major functionality issue)
- 🟡 Medium (minor functionality issue)
- 🟢 Low (cosmetic issue)

**Browser/Device:** Chrome 121 on Windows 11 / iPhone 13 iOS 17

**Steps to Reproduce:**
1. Open dialog
2. Click first response option
3. Close dialog during typewriter animation

**Expected:** Dialog closes cleanly with no errors

**Actual:** Console error appears, state not cleaned up

**Screenshot/Video:** [if available]

---

## Test Results Summary

### Test Date: _____________
### Tester Name: _____________

### Desktop Browsers Tested:
- [ ] Chrome - Version: _____ - Result: ☐ Pass ☐ Fail
- [ ] Firefox - Version: _____ - Result: ☐ Pass ☐ Fail
- [ ] Safari - Version: _____ - Result: ☐ Pass ☐ Fail
- [ ] Edge - Version: _____ - Result: ☐ Pass ☐ Fail

### Mobile Devices Tested:
- [ ] iOS Device: _____ - Result: ☐ Pass ☐ Fail
- [ ] Android Device: _____ - Result: ☐ Pass ☐ Fail

### Critical Path Tests:
- [ ] Basic dialog flow - ☐ Pass ☐ Fail
- [ ] Arabic RTL layout - ☐ Pass ☐ Fail
- [ ] Dialog close methods - ☐ Pass ☐ Fail
- [ ] Responsive layout - ☐ Pass ☐ Fail
- [ ] Animation quality - ☐ Pass ☐ Fail

### Edge Case Tests:
- [ ] Rapid clicks - ☐ Pass ☐ Fail
- [ ] Close during animation - ☐ Pass ☐ Fail
- [ ] "لم أفهم" option - ☐ Pass ☐ Fail

### Bugs Found: _____
- Critical: _____
- High: _____
- Medium: _____
- Low: _____

### Overall Assessment:
☐ **PASS** - Ready for production  
☐ **PASS WITH MINOR ISSUES** - Non-critical issues documented  
☐ **FAIL** - Critical issues require fixes

### Notes:
[Any additional observations or comments]

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document test results in this file
2. Sign off on completion
3. Mark Task 20.4 as complete
4. Feature ready for production deployment

### If Issues Found 🔴
1. Document all bugs using bug report template
2. Prioritize bugs by severity
3. Create GitHub issues for each bug
4. Fix critical and high priority bugs
5. Re-test after fixes
6. Iterate until all critical issues resolved

---

**For comprehensive testing procedures, see:**
- `TASK_20.4_MANUAL_TESTING_GUIDE.md` - Full testing guide
- `TASK_20.4_COMPLETION.md` - Known limitations and requirements validation

**Document Version:** 1.0  
**Last Updated:** January 2025
