# SCNX Documentation Standard: The 13-Pillar README

> This document defines the "Gold Standard" for component documentation. Every component README must follow this structure to ensure architectural clarity and enterprise-grade consistency.

---

## 0. The Header & USP

### The USP (Unique Selling Proposition)
Located at the very top as a blockquote.
> [!IMPORTANT]
> **USP** is your "Elevator Pitch". It tells a developer why this component exists and why it's better than alternatives in **one sentence**. Focus on the unique engineering feats (e.g., Performance, Interruptibility, Surgical Re-renders).

### Metadata Block
Immediately following the USP, provide:
- **Package**: The NPM/Monorepo package name (`@scnx/core-ui` or `@scnx/system`).
- **Status**: Visual indicator of stability (`Alpha`, `Beta`, `Stable`).
- **Source**: Link to the primary source file for absolute transparency.

---

## 1. Table of Contents (The 13 Pillars)

Standard numbering and structure must be followed:
1.  [Overview](#1-overview)
2.  [When to Use](#2-when-to-use)
3.  [Quick Start](#3-quick-start)
4.  [Components](#4-components)
5.  [Usage](#5-usage)
6.  [API Reference](#6-api-reference)
7.  [Advanced](#7-advanced)
8.  [Internal](#8-internal)
9.  [Accessibility (A11y)](#9-accessibility-a11y)
10. [Best Practices](#10-best-practices)
11. [Related](#11-related)
12. [Imports](#12-imports)
13. [Changelog](#13-changelog)

---

## 2. Pillar Guidelines

### 1. Overview
Contains the **Complete Feature List**. 
- List every capability (bold term) with a brief one-sentence explanation.
- No deep-dives here; just reach and scope.

### 2. When to Use
A binary guide for developers. 
- **Checklist (✅)**: Ideal use-cases.
- **Cross-list (❌)**: Anti-patterns and "Instead Use X" suggestions.

### 7. Advanced (Theoretical Reality)
Deep-dive into **Architectural Philosophies**.
- Explain concepts like **Momentum Reversal**, **Double-Sync Invariants**, or **Race Condition Protection**.
- This is where you explain "The Soul" of the component.

### 8. Internal (Mechanical Structure)
Deep-dive into **Implementation Logic**.
- Mention specific data structures (e.g., `Map` for Event Bus).
- Explain technical orchestration (e.g., **Double-RAF Loop** or **Dual-Context Split**).
- This is where you explain "The Engine" of the component.

### 10. Best Practices (Governance)
Document the **Unbreakable Rules** for maintainers.
- **Zero-Frame Rule**: Why components must start hidden on mount.
- **Surgical Discipline**: Rules about re-render propagation.
- **Identity Stability**: Requirement for deterministic, SSR-safe IDs.

---

© 2026 SCNX UI System Documentation.
