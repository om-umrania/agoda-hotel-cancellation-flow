# Voya cancellation prototype

Interactive prototype using **simulated Agoda API responses**. Android only. It follows the wireframes in the submission deck.

- `lib/fixtures.ts`: ten invented test bookings. Demo date is Sunday 25 October 2026.
- `lib/simulated-agoda.ts`: simulated Cancel Preview, Cancel Confirm and Booking Detail. Confirm validates `bookingId`, `reference` and `refundRate` against the last Preview and returns HTTP 200 with an empty body on success.
- `lib/voya.ts` and `app/api/voya/*`: the Voya backend layer. The phone talks only to these routes. Request deduplication here is Voya's own and is not sent to Agoda.
- `components/Prototype.tsx`: the phone UI and a panel showing the simulated calls.

Waits are shortened for the demo; Agoda documents up to 120 seconds for Preview and Confirm. The server keeps no state, so the client sends what has already happened with each request.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

No credentials, real guest data or live Agoda calls are used. Keep any real Agoda site ID or API key out of the repository.
