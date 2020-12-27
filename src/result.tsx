export function Result({ pool, targets }: {
  pool: string[][],
  targets: string[][]
}) {
  return <>
    <div>
      {pool.map(row => <div>
        {row.map(cell => <div>
          {cell}
        </div>)}
      </div>)}
    </div>
  </>
}