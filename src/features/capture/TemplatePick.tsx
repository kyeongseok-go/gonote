// 회의를 시작한 **직후에만** 뜨는 줄. 안건도 기록도 없을 때다.
//
// 시작 전에 틀을 고르게 하면 그만큼 회의가 늦어진다. 그래서 먼저 시작시키고,
// 정말 필요한 순간(아직 아무것도 없을 때)에 한 번 권한다. 한 줄이라도 적으면 사라진다.
import { useApp } from '../../store/app'
import { TEMPLATES } from '../../domain/templates'
import '../meetings/info.css'

export function TemplatePick({ meetingId }: { meetingId: string }) {
  const applyTemplate = useApp((s) => s.applyTemplate)
  const usable = TEMPLATES.filter((row) => row.agendas.length > 0)

  return (
    <section className="tpl" aria-label="회의 틀">
      <p className="tpl__why">안건을 미리 깔아 둘까요? 적는 동안 뼈대가 돼요.</p>
      <div className="tpl__row">
        {usable.map((template) => (
          <button
            key={template.id}
            type="button"
            className="tpl__item"
            onClick={() => applyTemplate(meetingId, template.id)}
          >
            <span className="tpl__name">{template.name}</span>
            <span className="tpl__hint">{template.hint}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
