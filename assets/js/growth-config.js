/* Direct contact: activate both values only after the receiver and real delivery are verified.
   The Turnstile sitekey is public. Its secret belongs only in the separate Worker.
   No new external requests while leadEndpoint is empty. See services/leads/README.md. */
window.WPS_GROWTH_CONFIG = Object.freeze({ leadEndpoint: '', turnstileSitekey: '' });
