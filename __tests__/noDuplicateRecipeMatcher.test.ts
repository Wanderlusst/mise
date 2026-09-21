import fs from 'fs'
import path from 'path'

test('recipe-match percentage calculations only live in matchEngine', () => {
  const root = path.resolve(__dirname, '..')
  const forbidden = /computeRecipePantryMatch|matchPercentage|matchedRequired\s*\/|effectiveMatched\s*\//
  const allowed = new Set([path.join(root, 'lib', 'matchEngine.ts'), __filename])
  const files = fs.readdirSync(path.join(root, 'lib')).filter((file) => file.endsWith('.ts'))

  for (const file of files) {
    const filename = path.join(root, 'lib', file)
    if (!allowed.has(filename)) {
      expect(fs.readFileSync(filename, 'utf8')).not.toMatch(forbidden)
    }
  }
})
