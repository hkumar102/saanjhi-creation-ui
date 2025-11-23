# 🧵 Saanjhi Creation UI

This is the **Angular frontend** for [Saanjhi Creation](https://saanjhicreation.com), a multi-country online clothing rental platform operating in **India 🇮🇳** and **USA 🇺🇸**.

---

## 🖥️ Features

- Admin Portal for managing:
  - Products & Inventory
  - Rentals & Customers
  - Notifications
  - Dashboards
- Multi-step workflow for product creation
- PrimeNG 19 + PrimeFlex 4 UI
- Firebase Authentication
- Notification Center UI
- Responsive layout (mobile/tablet/desktop)

---

## 📦 Tech Stack

- Angular 19 (Standalone Components)
- PrimeNG 19
- Firebase Auth
- RxJS + lastValueFrom
- Tailored UI components (`saanjhi-ui-*`)
- Dockerized build

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/<your-org>/saanjhi-creation-ui.git

# Install dependencies
npm install

# Start dev server
ng serve

export DOCKER_HUB_USER=hunnysharma102                                                                  
export TAG=hemantkumar

docker buildx build --build-arg NG_BUILD_CONFIG=development --no-cache -f "Dockerfile" -t "${DOCKER_HUB_USER}/saanjhi.admin.ui:${TAG}" --push .

docker buildx build --no-cache --platform linux/amd64 --build-arg NG_BUILD_CONFIG=production --no-cache -f "Dockerfile" -t "${DOCKER_HUB_USER}/saanjhi.admin.ui:${TAG}" --push .