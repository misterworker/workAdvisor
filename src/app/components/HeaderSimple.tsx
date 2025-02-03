"use client"
import { useState, useEffect } from 'react';
import { Burger, Container, Group } from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import classes from './HeaderSimple.module.css';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';

const links = [
  { link: '/salary', label: 'Salary' },
  { link: '/post-prediction', label: 'Post Prediction' },
  { link: '/education', label: 'Education' },
];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState("");
  const [scroll] = useWindowScroll();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (scroll.y > lastScrollY) { // scrolling down
      setIsVisible(false);
    } else { // scrolling up
      setIsVisible(true);
    }
    setLastScrollY(scroll.y);
  }, [scroll.y]);

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={() => {
        setActive(link.link);
      }}
    >
      {link.label}
    </Link>
  ));

  return (
    <header className={`${classes.header} ${isVisible ? classes.visible : classes.hidden}`}>
      <Container size="md" className={classes.inner}>
        <Link href="/" onClick={() => {
          setActive("")
        }}>
          <Briefcase />
        </Link>
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
