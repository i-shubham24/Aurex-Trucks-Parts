import { Link, useSearchParams } from "react-router-dom";
import { formatAUD } from "../data/products";
import { useCompany, useSite } from "../store/site";
import EmailLink from "../components/EmailLink";

const UPDATED = "9 October 2026";

/* Policy copy is built from live store settings (freight fees, contact details, ABN)
   so it can never drift from what checkout actually charges or where we really are. */
function buildPolicies({ company, settings }) {
  const freeOver = formatAUD(settings.freeFreightOver || 500);
  const standard = formatAUD(settings.standardFee || 0);
  const express = formatAUD(settings.expressFee || 0);
  const { name, phone, email, address, hours } = company;

  return [
    {
      id: "shipping", label: "Shipping", title: "Shipping and collection",
      intro: `Every order is picked and packed at our Campbellfield warehouse and trade counter (${address}).`,
      body: [
        ["Dispatch", [
          "Orders placed before 2:00 pm (Melbourne time) on a business day are dispatched the same day, provided payment has been received. Orders placed later, or on a weekend or public holiday, go out the next business day.",
          "Bank transfer orders are released for packing once the transfer shows in our account, so the dispatch day runs from when your payment lands, not from when the order was placed.",
        ]],
        ["Freight options and cost", [
          `Standard road freight is ${standard} per order, and free when the goods total ${freeOver} or more after any promo discount.`,
          `Express freight is a flat ${express} per order.`,
          "Click and Collect from Campbellfield is free.",
          "All freight prices include GST and are shown in the order summary before you place the order. The amount on your tax invoice is the amount calculated by our system at that point.",
        ]],
        ["Delivery times", [
          "Typical transit times once dispatched: Melbourne metro 1 business day; Sydney, Brisbane and Adelaide 1 to 2 business days; Perth, Tasmania, the Northern Territory and regional areas 2 to 5 business days.",
          "These are carrier estimates, not guarantees. Remote postcodes, weather and carrier delays can add time. If a delivery is running late, call us with your order ID and we will chase the carrier.",
        ]],
        ["Click and Collect", [
          `Orders are normally ready within 4 business hours. Counter hours are ${hours}.`,
          "Bring your order ID and photo ID. If someone else is collecting for you, give them the order ID and tell us their name beforehand. Orders paid for at the counter are paid in full before the goods leave.",
        ]],
        ["Tail lifts and other quoted lines", [
          "Tail lifts and any part shown as “Enquire” are not sold through the online checkout. They are quoted individually, and freight for these items (pallet or tail-lift delivery) is quoted with the price because it depends on size, weight and your site access.",
        ]],
        ["Where we deliver", [
          "We deliver Australia-wide. Road freight goes to a street address or depot rather than a PO box, and someone needs to be there to receive it, so tell us in the delivery notes if the site has restricted hours or access.",
        ]],
        ["Tracking", [
          "Your order ID (for example ATP-123456-789) is shown on the confirmation page and on your tax invoice, so keep a note of it. Enter it on the Track Order page at any time to see whether the order is awaiting payment, packed, with the courier or delivered.",
        ]],
        ["Damage or missing items", [
          "Check the delivery when it arrives. If a carton is damaged or something is missing, note it with the driver if you can, keep the packaging, and tell us straight away with photos and your order ID so we can lodge the claim with the carrier and send a replacement.",
        ]],
      ],
    },
    {
      id: "returns", label: "Returns", title: "Returns and refunds",
      intro: "If a part is not right, talk to us before sending anything back. Most problems are sorted with one phone call and a photo.",
      body: [
        ["Change of mind", [
          "You can return unused parts within 30 days of delivery or collection for a refund or account credit. The part must be unfitted, unmarked and in its original packaging, with all hardware, keys and instructions.",
          "For change-of-mind returns the freight each way is at your cost.",
        ]],
        ["If we got it wrong", [
          "If we supplied the wrong part, or we confirmed fitment against your VIN, photos or measurements and the part does not fit, we will swap or refund it and pay the freight both ways.",
        ]],
        ["Faulty or damaged goods", [
          "Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. If a part is faulty, not as described or arrives damaged, you are entitled to the remedies set out in our Warranty policy, regardless of the 30-day change-of-mind window.",
        ]],
        ["How to return a part", [
          `1. Contact us on ${phone} or ${email} with your order ID, the part number and photos of the part and its label.`,
          "2. We confirm the return and give you the return address and reference. Please do not send parts back without this, as we cannot match unannounced parcels to an order.",
          "3. Pack the part so it arrives in the condition you received it and send it by a tracked service, or drop it at the Campbellfield counter.",
        ]],
        ["Refunds", [
          "Once the part is back and checked, we refund the original payment method, or credit your trade account if you bought on terms. Bank transfer refunds are paid to the account you nominate.",
          "The original outbound freight is refunded only where the return is due to a fault or our error.",
        ]],
        ["What cannot be returned", [
          "Parts that have been fitted, welded, drilled, cut, painted or otherwise modified.",
          "Items made, configured or brought in specially for you, including tail lifts quoted to your body and any special-order line.",
          "Electrical and hydraulic components once they have been installed or connected.",
          "None of these exclusions limit your rights where the goods are faulty.",
        ]],
      ],
    },
    {
      id: "warranty", label: "Warranty", title: "Warranty",
      intro: `This warranty is given by ${name}, ${address}. Phone ${phone}, email ${email}.`,
      body: [
        ["What is covered", [
          "Parts we sell are warranted against defects in materials and workmanship for 12 months from the date of delivery or collection. Where a manufacturer offers a longer warranty on a product, the longer period applies and is stated on the product page or your quote.",
        ]],
        ["Your rights under the Australian Consumer Law", [
          "Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced if the goods fail to be of acceptable quality and the failure does not amount to a major failure.",
          "The benefits of this warranty are in addition to those rights and any other rights and remedies you have under a law in relation to the goods.",
        ]],
        ["How to claim", [
          `Contact us on ${phone} or ${email} within the warranty period with your order ID, the part number, photos or video of the fault and a short description of how the part was fitted and used.`,
          "We may ask for the part to be returned to Campbellfield for inspection. If the claim is accepted we repair or replace the part or refund the price, and we reimburse your reasonable freight costs for returning it.",
        ]],
        ["What is not covered", [
          "Normal wear, corrosion from lack of maintenance, and consumable items that are expected to wear in service.",
          "Damage from incorrect installation, fitting against our fitment advice, modification, accident, misuse or overloading beyond the rated capacity.",
          "Labour, downtime or hire costs, except where the Australian Consumer Law gives you a right to them.",
        ]],
        ["Tail lifts", [
          "Tail lifts must be installed, wired and commissioned by a qualified installer in line with the manufacturer's instructions and the rated capacity on the compliance plate, and serviced at the stated intervals. Keep your installation and service records, as we will ask for them with a claim.",
        ]],
      ],
    },
    {
      id: "terms", label: "Terms", title: "Terms of sale",
      intro: `These terms apply to every order placed with ${name}${settings.abn ? ` (${/abn/i.test(settings.abn) ? settings.abn : `ABN ${settings.abn}`})` : ""} through this website, by phone or at the counter.`,
      body: [
        ["Prices", [
          "All prices are in Australian dollars and include GST. The GST amount is itemised on your tax invoice.",
          "Prices can change without notice, but the price that applies to your order is the one shown in the order summary when you place it. If a part is listed at an obviously incorrect price we will contact you before doing anything, and you can cancel for a full refund.",
        ]],
        ["Placing an order", [
          "You can order as a guest or from an account. Placing an order is an offer to buy; we accept it when we confirm the order, and we check stock at that moment, so an order cannot be placed for more than we hold.",
          "If something goes wrong after that (for example stock is found damaged when picked) we will offer you a replacement date, an alternative or a refund.",
        ]],
        ["Parts priced on enquiry", [
          "Tail lifts and parts marked “Enquire” are sold by written quote only. Send an enquiry with your vehicle and body details and we aim to reply within 4 business hours. A quote is valid for the period stated on it and becomes an order when you accept it and pay or, for trade accounts, issue a purchase order.",
        ]],
        ["Payment", [
          "The payment methods available for your order are shown at checkout. For bank transfer, use your order ID as the payment reference; goods are dispatched once the funds have cleared. Pay on pickup is available with Click and Collect only.",
          "We do not store card details on this website.",
        ]],
        ["Trade accounts", [
          "Approved trade and fleet accounts can buy on 30-day terms up to their agreed credit limit. Invoices are due 30 days from the invoice date. If an account is overdue we may hold further orders or move the account back to prepaid until it is brought up to date.",
        ]],
        ["Promo codes", [
          "One promo code can be used per order. Codes may have a minimum order value or an expiry date, cannot be applied after an order has been placed, and cannot be exchanged for cash.",
        ]],
        ["Fitment and safe use", [
          "We match parts against the make, model, VIN, photos and measurements you give us, and we will tell you if we are not sure. You are responsible for checking a part against the vehicle before it is fitted.",
          "Parts must be fitted by a competent person following the manufacturer's instructions, torque settings and load ratings. Anything that affects vehicle safety or compliance (door gear, load restraint, lighting and marker plates, tail lifts) must be installed so the vehicle continues to meet the applicable Australian Design Rules and heavy vehicle standards.",
        ]],
        ["Ownership and risk", [
          "Goods remain our property until paid for in full. Risk passes to you when the goods are delivered to your address or collected from our counter.",
        ]],
        ["Liability", [
          "Nothing in these terms excludes or limits any guarantee or right you have under the Australian Consumer Law. Beyond those rights, and to the extent the law allows, our liability for a part is limited to repairing or replacing it or refunding its price.",
        ]],
        ["Governing law", [
          "These terms are governed by the laws of Victoria, Australia.",
        ]],
      ],
    },
    {
      id: "privacy", label: "Privacy", title: "Privacy",
      intro: `${name} handles personal information in line with the Privacy Act 1988 (Cth) and the Australian Privacy Principles.`,
      body: [
        ["What we collect", [
          "Account details: your name, email address, phone number and, if you give it, your company name. Passwords are stored in hashed form; we cannot see them.",
          "Order details: the delivery address, the parts ordered, delivery notes and your payment method and status.",
          "Enquiry details: the vehicle, body and part information, photos and any message you send with a quote request or contact form.",
        ]],
        ["What we do not collect", [
          "We do not collect or store card numbers on this website. This site does not use advertising or third-party analytics trackers.",
        ]],
        ["How we use it", [
          "To process and deliver your orders, answer enquiries and quotes, confirm fitment, handle returns and warranty claims, manage trade accounts, and meet our tax and record-keeping obligations.",
          "If you sign up for stock and price updates we use your email for that only, and you can unsubscribe at any time.",
        ]],
        ["Who we share it with", [
          "Freight carriers receive the name, address and phone number needed to deliver your order.",
          "Service providers that run this website for us: our hosting, database, image hosting and email delivery providers, and our payment provider if you pay by card. Some of these providers store data on servers outside Australia.",
          "We do not sell or rent personal information to anyone.",
        ]],
        ["Cookies and browser storage", [
          "We set a secure sign-in cookie when you log in, so you stay signed in. Your browser also keeps a copy of your recent orders and a few preferences on your own device so pages load faster. Clearing your browser data removes these.",
        ]],
        ["How long we keep it", [
          "Order and invoice records are kept for at least five years, as Australian tax law requires. Account details are kept while your account is open. Enquiries that do not become orders are kept only as long as needed to follow them up.",
        ]],
        ["Access, correction and deletion", [
          `You can see and update your details from your account at any time. To ask for a copy of the information we hold, to have it corrected, or to close your account, email ${email} or call ${phone}. We respond within 30 days.`,
        ]],
        ["Complaints", [
          `If you think we have mishandled your information, contact us first at ${email} so we can put it right. If you are not satisfied with our response you can complain to the Office of the Australian Information Commissioner at oaic.gov.au.`,
        ]],
      ],
    },
  ];
}

export default function Policies({ initial = "shipping" }) {
  const company = useCompany();
  const { settings } = useSite();
  const [params, setParams] = useSearchParams();
  const tabs = buildPolicies({ company, settings });

  const wanted = params.get("tab") || initial;
  const active = tabs.find((t) => t.id === wanted) || tabs[0];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-[12px] text-faint"><Link to="/" className="hover:text-navy hover:underline">Home</Link> / <span className="font-semibold text-ink">Policies</span></p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">The fine print, plainly written.</h1>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Policies">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active.id === t.id}
            onClick={() => setParams({ tab: t.id }, { replace: true })}
            className={`rounded-md px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${active.id === t.id ? "bg-ink text-white" : "bg-mist text-steel hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-line bg-white">
        <div className="border-b border-line bg-mist px-5 py-4">
          <h2 className="text-base font-extrabold">{active.title}</h2>
          <p className="mt-1 text-sm leading-6 text-steel">{active.intro}</p>
        </div>
        <div className="divide-y divide-line">
          {active.body.map(([heading, paragraphs]) => (
            <div key={heading} className="grid grid-cols-1 gap-1.5 px-5 py-4 sm:grid-cols-[200px_minmax(0,1fr)]">
              <h3 className="text-sm font-bold">{heading}</h3>
              <div className="space-y-2">
                {paragraphs.map((text) => (
                  <p key={text} className="text-sm leading-6 text-steel">{text}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-steel">
        Something not covered? Call <a className="font-bold text-navy underline" href={company.phoneHref}>{company.phone}</a> or email{" "}
        <EmailLink email={company.email} className="font-bold text-navy underline" />. Last updated {UPDATED}.
      </p>
    </main>
  );
}
