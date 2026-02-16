# 🐱 KITTI: The AI Emotional Companion

> **Redefining daily emotional regulation for the Youth.**
>
> **Team Name:** Isomer  
> **Problem Statement:** PS–05 (Mental Well-Being & Stress Management)  
> **Domain:** Mobile App Development

---

## 📖 Overview

**KITTI** is a privacy-first, AI-powered emotional companion designed to bridge the gap between high digital connectivity and emotional isolation. By gamifying mental wellness through a "digital pet" interface, KITTI transforms the chore of journaling into a comforting, daily habit.

Unlike generic chatbots, KITTI remembers your context, tracks your "Vibe," and offers proactive, safety-first support—all without sending your private journals to the cloud.

---

## ✨ Key Features

### 🤖 **Proactive Companionship**
* **Chat-to-Journal:** No typing required! Just vent to KITTI, and our engine automatically drafts structured journal entries.
* **Context-Aware Memory:** KITTI remembers past conversations to provide continuity and genuine empathy.

### 🐾 **Gamified Wellness**
* **Digital Pet Interface:** An interactive, living pet that reacts to your mood and grows with you to reduce clinical stigma.
* **Vibe Check Engine:** Real-time sentiment analysis that tracks your emotional trends (0-100 scale).

### 🔒 **Privacy & Safety**
* **Local-First Architecture:** All sensitive journal data is stored locally on your device via AsyncStorage.
* **SOS Safety Net:** Immediate resource linking for users in crisis.

---

## 📸 Screenshots


| <img src=".src/assets/screengif.gif" alt="Home Screen" width="200"> | <img src=".src/assets/ss2.png" alt="Chat Screen" width="200"> | <img src=".src/assets/ss3.png" alt="Analysis Screen" width="200"> |
| <img src=".src/assets/ss1.png" alt="Home Screen" width="200"> | <img src=".src/assets/ss2.png" alt="Chat Screen" width="200"> | <img src=".src/assets/ss3.png" alt="Analysis Screen" width="200"> |
| <img src=".src/assets/ss1.png" alt="Home Screen" width="200"> | <img src=".src/assets/ss2.png" alt="Chat Screen" width="200"> | <img src=".src/assets/ss4.png" alt="Analysis Screen" width="200"> |
| <img src=".src/assets/ss1.png" alt="Home Screen" width="200"> | <img src=".src/assets/ss2.png" alt="Chat Screen" width="200"> | <img src=".src/assets/ss5.png" alt="Analysis Screen" width="200"> |
| <img src=".src/assets/ss1.png" alt="Home Screen" width="200"> | <img src=".src/assets/ss2.png" alt="Chat Screen" width="200"> | <img src=".src/assets/ss6.png" alt="Analysis Screen" width="200"> |

---

## 🛠️ Tech Stack

* **Frontend:** React Native (Expo Router)
* **AI Engine:** Google Gemini API (Generative AI)
* **Storage:** AsyncStorage (Local / Offline-First)
* **Styling:** React Native Paper / @pchmn/expo-material3-theme'
* **Language:** TypeScript / JavaScript

---

## 🚀 Installation & Setup

Follow these steps to run the project locally:

**1. Clone the repository**
```bash
git clone [https://github.com/your-username/kitti.git](https://github.com/your-username/kitti.git)
cd kitti

**1. Install dependencies**
npm install
# or
yarn install

**Setup API Keys**

Create a folder named constants in the root directory.

Inside that folder, create a file named keys.ts.

Add your Gemini API Key inside keys.ts like this:

TypeScript
// constants/keys.ts
export const GEMINI_API_KEY = "your_actual_api_key_here" //arrays of keys here;

**Run the App*
npx expo start
Scan the QR code with the Expo Go app on your phone.


*--or get an apk--*

npx expo prebuild
cd android
./gradlew assembleRelease


**Future Roadmap**
[ ] Community: Anonymous peer support groups for shared experiences.

[ ] Voice Mode: Real-time hands-free voice conversations.

**Contributors**
Isomer
Made with ❤️ by Isomer
