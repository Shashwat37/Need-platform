/**
 * SectionHeading.jsx — the small label + big title used above each section.
 *
 * Keeping this in one component means every section on every page is spaced
 * and styled identically, which is what makes a page look designed rather
 * than assembled.
 */
export default function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const isCentre = align === 'center'

  return (
    <div className={isCentre ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <p className={`eyebrow flex items-center gap-2.5 ${isCentre ? 'justify-center' : ''}`}>
          <span className="h-px w-6 bg-brand-600/40" />
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-extrabold leading-[1.1] text-ink sm:text-[2.5rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{description}</p>
      )}
    </div>
  )
}
