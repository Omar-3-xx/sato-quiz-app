# Sato New Starter Quiz

Live quiz for Sato Pharma new-starter onboarding, run by Talent Acquisition. Players join on their phones with a QR code or a 6-digit code; the host runs the quiz on the projector. Ranking: most correct answers first, then the fastest total time on correct answers. Only number one wins the gift.

Dressed in the HR premium identity (SATO-DIS-2026-01 raised to premium).

Live: https://omar-3-xx.github.io/sato-quiz-app/

Quizzes: Rep Brain Test (10), Mind Tricks (10), Mind Tricks: Easy (10), Mind Tricks: Full (40), Test Drive (4). All quizzes and questions are managed in the admin pages.

## Running a session
1. On the laptop connected to the projector, open the site and choose **Host a quiz** (or add `?host` to the address).
2. Pick the quiz, check the host name, choose **Open the quiz room**.
3. Players scan the QR code, or open the site and type the code. Their names appear on screen.
4. Choose **Start the quiz**. Each answer is revealed when time runs out or everyone has answered (or choose **Reveal the answer**).
5. Choose **Next question** after each answer. After the last one, the final ranking shows the podium; number one wins the gift.

Keep the same browser on the same laptop for the whole session: host controls only work where the room was opened.

## Quiz admin
Open the site with `?admin` (or the **Quiz admin** link) and enter the 6-digit admin PIN.
- **Quizzes:** add, rename, reorder, hide or delete quizzes; add, edit, reorder or delete questions. Each question has 2 to 4 options, the correct answer, a time limit (5 to 120 seconds), a label, an explanation shown after the answer, and an optional question picture and answer picture (upload or paste a link).
- **Rooms:** see every room with its status, players and progress; end or delete a room.
- **Settings:** change the admin PIN.

Rooms keep the question list they were opened with, so editing a quiz during a live session does not disturb it.

## How it works
A static site (this repo) on GitHub Pages, with Supabase for live state. All timing and scoring run in the database, and the answer keys never reach the phones before the reveal.
