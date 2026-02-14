import { TOOL_FAQS } from '../config/faqs.js'

/**
 * Create FAQ section for tool page
 * @param {string} toolId
 * @returns {HTMLElement}
 */
export function createFAQSection(toolId) {
  const faqs = TOOL_FAQS[toolId]
  if (!faqs || faqs.length === 0) {
    return document.createElement('div') // Return empty div if no FAQs
  }

  const section = document.createElement('div')
  section.className = 'bg-white rounded-lg shadow-md p-8 mt-8'

  const title = document.createElement('h2')
  title.className = 'text-2xl font-bold text-gray-900 mb-6'
  title.textContent = 'Frequently Asked Questions'
  section.appendChild(title)

  const faqList = document.createElement('div')
  faqList.className = 'space-y-6'

  faqs.forEach((faq, index) => {
    const faqItem = document.createElement('div')
    faqItem.className = 'border-b border-gray-200 pb-6 last:border-b-0 last:pb-0'

    const question = document.createElement('h3')
    question.className = 'text-lg font-semibold text-gray-900 mb-2'
    question.textContent = faq.question

    const answer = document.createElement('p')
    answer.className = 'text-gray-700 leading-relaxed'
    answer.textContent = faq.answer

    faqItem.appendChild(question)
    faqItem.appendChild(answer)
    faqList.appendChild(faqItem)
  })

  section.appendChild(faqList)

  // Add FAQ schema markup
  addFAQSchema(toolId, faqs)

  return section
}

/**
 * Add FAQ schema markup to page
 * @param {string} toolId
 * @param {Array} faqs
 */
function addFAQSchema(toolId, faqs) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  // Remove existing FAQ schema
  const existing = document.querySelector('script[data-schema-type="faq"]')
  if (existing) {
    existing.remove()
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-schema-type', 'faq')
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

/**
 * Remove FAQ schema from page
 */
export function removeFAQSchema() {
  const existing = document.querySelector('script[data-schema-type="faq"]')
  if (existing) {
    existing.remove()
  }
}
