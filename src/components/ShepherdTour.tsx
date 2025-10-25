import { useEffect } from 'react'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'
import '../styles/shepherd-theme.css'

interface ShepherdTourProps {
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
}

const ShepherdTour: React.FC<ShepherdTourProps> = ({ isActive, onComplete, onSkip }) => {
  useEffect(() => {
    if (!isActive) return

    // Initialize Shepherd tour
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-aieve',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: {
          enabled: true,
        },
        highlightClass: 'shepherd-highlight',
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
      }
    })

    // Step 1: Dashboard Overview
    tour.addStep({
      title: '<div class="shepherd-step-header">Step 1 of 4</div>Dashboard Overview',
      text: 'Welcome to your command center! Here you can see all your projects, upcoming deadlines, daily to-dos and revenue at a glance.',
      attachTo: {
        element: '[data-tour="dashboard"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Skip Tour',
          action: () => tour.cancel(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => tour.next(),
          classes: 'shepherd-button-primary'
        }
      ]
    })

    // Step 2: Content Calendar
    tour.addStep({
      title: '<div class="shepherd-step-header">Step 2 of 4</div>Content Calendar',
      text: 'Plan your content like a pro. Never miss a deadline and stay consistent across all platforms.',
      attachTo: {
        element: '[data-tour="calendar"]',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          action: () => tour.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => tour.next(),
          classes: 'shepherd-button-primary'
        }
      ]
    })

    // Step 3: Brand Deals
    tour.addStep({
      title: '<div class="shepherd-step-header">Step 3 of 4</div>Brand Deals',
      text: 'Track all your brand partnerships here. Add new deals, update statuses, and never lose track of a collaboration again.',
      attachTo: {
        element: '[data-tour="brand-deals"]',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          action: () => tour.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: () => tour.next(),
          classes: 'shepherd-button-primary'
        }
      ]
    })

    // Step 4: Invoices
    tour.addStep({
      title: '<div class="shepherd-step-header">Step 4 of 4</div>Invoices',
      text: 'Generate professional invoices in seconds. Keep track of payments and get paid faster!',
      attachTo: {
        element: '[data-tour="invoices"]',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          action: () => tour.back(),
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Done',
          action: () => tour.complete(),
          classes: 'shepherd-button-primary'
        }
      ]
    })

    // Event handlers
    tour.on('complete', () => {
      // Show celebration modal
      showCelebrationModal()
      onComplete()
    })
    tour.on('cancel', onSkip)

    // Start the tour
    tour.start()

    // Cleanup
    return () => {
      if (tour.isActive()) {
        tour.cancel()
      }
    }
  }, [isActive, onComplete, onSkip])

  const showCelebrationModal = () => {
    // Create celebration modal
    const modal = document.createElement('div')
    modal.className = 'celebration-modal'
    modal.innerHTML = `
      <div class="celebration-content">
        <div class="celebration-text">
          <h2>You're all set! 🎉</h2>
          <div class="confetti">
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modal)

    // Remove modal after animation
    setTimeout(() => {
      modal.remove()
    }, 3000)
  }

  return null // This component doesn't render anything directly
}

export default ShepherdTour