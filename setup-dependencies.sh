#!/bin/bash

# Exit on any failure
set -e

echo "📦 Installing Firebase, PrimeNG, and utility packages..."

# Firebase core + AngularFire
yarn add firebase @angular/fire

# PrimeNG and PrimeIcons
yarn add primeng primeicons primeflex

# Peer dependencies for PrimeNG (required for newer versions)
yarn add @angular/cdk

# Optional: Add Sentry for error monitoring (match backend)
yarn add @sentry/angular @sentry/tracing

echo "✅ Dependencies installed:"
echo "  - Firebase + AngularFire"
echo "  - PrimeNG + PrimeIcons + PrimeFlex"
echo "  - Optional: Sentry"

echo ""
echo "🧩 Next Steps:"
echo "  1. Set up Firebase config in shared-common."
echo "  2. Create custom layout/header/footer components in shared-ui."
echo "  3. Create AppRoutes using standalone `RouterModule.forRoutes([])`"
