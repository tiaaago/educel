import base from '@/styles/Base.module.css'

export default function Modal(ctx) {
    return (
        <>
            <div className={`${base.modalWrapper} ${ctx.wrapperCustomClasses?.length > 0 ? ctx.wrapperCustomClasses.map((item) => `${item}`) : ''}`}>
                <div className={`${base.modal} ${ctx.customClasses?.length > 0 ? ctx.customClasses.map((item) => `${item}`) : ''}`}>
                    {ctx.children}
                </div>
            </div>
        </>
    )
}