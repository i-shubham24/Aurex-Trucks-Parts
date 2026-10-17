/**
 * Utility to trigger the rating prompt modal from anywhere in the app
 * (e.g., from the My Orders screen on delivered orders).
 */
export function openRatingModal(payload) {
  window.dispatchEvent(
    new CustomEvent('aurex:open-rating-modal', {
      detail: payload,
    })
  );
}

export default openRatingModal;
