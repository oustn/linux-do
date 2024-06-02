import { Category } from '@src/core/type';
import Typography from '@mui/material/Typography';

interface CategoryProps {
  categories: Array<Category>;
  id?: number;
}

function findCategory(categories: Array<Category>, id?: number) {
  const queue = [...categories];
  while (queue.length) {
    const category = queue.shift();
    if (category?.id === id) {
      return category;
    }
    if (category?.subcategory_list) {
      queue.push(...category.subcategory_list as Array<Category>);
    }
  }
  return null;
}

export function CategoryTip({ categories, id }: CategoryProps) {
  const category = findCategory(categories, id);
  if (!category) {
    return null;
  }
  return (
    <Typography
      sx={{ display: 'inline' }}
      component="span"
      variant="body2"
      color="text.secondary"
    >
      <span style={{
        display: 'inline-block',
        width: '1em',
        height: '1em',
        marginRight: 4,
        backgroundColor: `#${category.color}`,
        position: 'relative',
        top: 2,
      }}></span>
      {category.name}
    </Typography>
  );
}
